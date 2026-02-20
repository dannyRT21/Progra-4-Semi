import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const DocentesView = {
  data() {
    return {
      cargandoEdicion: false,
      mostrarFormulario: false,
      editingId: null,
      buscar: "",
      docentes: [],
      form: {
        codigo: "",
        nombre: "",
        dui: "",
        email: "",
        telefono: "",
        direccion: "",
        escalafon: ""
      }
    };
  },

  computed: {
    docentesFiltrados() {
      const texto = (this.buscar || "").trim().toUpperCase();
      if (!texto) return this.docentes;
      const palabras = texto.split(/\s+/).filter(Boolean);

      return this.docentes.filter((d) => {
        if (!d?.codigo || !d?.nombre || !d?.dui) return false;
        const contenido = `${d.codigo} ${d.nombre} ${d.dui}`.toUpperCase();
        return palabras.every(p => contenido.includes(p));
      });
    }
  },

  watch: {
    "form.codigo"(val) {
      if (this.editingId !== null) return; // Evitar modificar si es edición
      const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const letras = v.replace(/[^A-Z]/g, "").slice(0, 4);
      const numeros = v.replace(/[^0-9]/g, "").slice(0, 6);
      const nuevo = letras + numeros;
      if (nuevo !== val) this.form.codigo = nuevo;
    },

    "form.telefono"(val) {
      const digits = (val ?? "").replace(/\D/g, "").slice(0, 8);
      const nuevo = digits.length <= 4 ? digits : digits.slice(0, 4) + "-" + digits.slice(4);
      if (nuevo !== val) this.form.telefono = nuevo;
    },

    "form.dui"(val) {
      const digits = (val ?? "").replace(/\D/g, "").slice(0, 9);
      const nuevo = digits.length <= 8 ? digits : digits.slice(0, 8) + "-" + digits.slice(8);
      if (nuevo !== val) this.form.dui = nuevo;
    }
  },

  methods: {
    async cargarDocentes() {
      this.docentes = await db.docentes.toArray();
    },

    seleccionarDocente(d) {
      this.editingId = d.idDocente;
      this.cargandoEdicion = true;

      this.form = {
        codigo: d.codigo ?? "",
        nombre: d.nombre ?? "",
        dui: d.dui ?? "",
        email: d.email ?? "",
        telefono: d.telefono ?? "",
        direccion: d.direccion ?? "",
        escalafon: d.escalafon ?? ""
      };

      this.mostrarFormulario = true;
      this.$nextTick(() => (this.cargandoEdicion = false));
    },

    async eliminarDocente(id, e) {
      if (e) e.stopPropagation();
      if (!confirm("¿Estás seguro de que deseas eliminar este docente?")) return;

      await db.docentes.delete(id);
      await this.cargarDocentes();

      if (this.editingId === id) this.cancelarFormulario();
      if (window.alertify) alertify.error("Docente eliminado");
    },

    async buscarDocentePorCodigo(codigo, ignoreId = null) {
      const code = (codigo ?? "").trim().toUpperCase();
      const found = await db.docentes.where("codigo").equals(code).first();
      if (!found) return null;
      if (ignoreId && found.idDocente === ignoreId) return null;
      return found;
    },

    generarId() {
      return Date.now().toString();
    },

    async registrarDocente() {
      const esNuevo = this.editingId === null;

      const codigo = (this.form.codigo || "").trim().toUpperCase();
      const nombre = (this.form.nombre || "").trim();
      const dui = (this.form.dui || "").trim();
      const email = (this.form.email || "").trim();
      const telefono = (this.form.telefono || "").trim();
      const direccion = (this.form.direccion || "").trim();
      const escalafon = this.form.escalafon || "";

      if (!codigo || !nombre || !dui || !email || !telefono || !direccion || !escalafon) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (!/^[A-Z]{4}[0-9]{6}$/.test(codigo)) {
        alert("Código inválido. Debe ser 4 letras y 6 números (ej: ABCD123456).");
        return;
      }

      if (!/^[0-9]{8}-[0-9]$/.test(dui)) {
        alert("DUI inválido. Debe tener el formato 12345678-9.");
        return;
      }

      if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
        alert("Teléfono inválido. Debe tener el formato 1234-5678.");
        return;
      }

      if (esNuevo) {
        const existente = await this.buscarDocentePorCodigo(codigo, null);
        if (existente) {
          alert(`El código ya existe y pertenece a: ${existente.nombre}`);
          return;
        }
      } else {
        const choque = await this.buscarDocentePorCodigo(codigo, this.editingId);
        if (choque) {
          alert(`El código ya existe y pertenece a: ${choque.nombre}`);
          return;
        }
      }

      const idDocente = this.editingId ?? this.generarId();

      const docente = {
        idDocente,
        codigo,
        nombre,
        dui,
        email,
        telefono,
        direccion,
        escalafon
      };

      const sha256 = CryptoJS.SHA256;
      docente.hash = sha256(JSON.stringify(docente)).toString();

      await db.docentes.put(docente);

      await this.cargarDocentes();
      this.cancelarFormulario();

      if (window.alertify) {
        alertify.success(esNuevo ? "Docente registrado" : "Docente actualizado");
      }
    },

    cancelarFormulario() {
      this.editingId = null;
      this.form = {
        codigo: "",
        nombre: "",
        dui: "",
        email: "",
        telefono: "",
        direccion: "",
        escalafon: ""
      };
      this.mostrarFormulario = false;
    }
  },

  async mounted() {
    await initDb();
    await this.cargarDocentes();

    makeDraggable(this.$refs.draggableCard, ".card-header");
    makeDraggable(this.$refs.draggableTable, ".drag-handle");
  },

  template: `
    <div class="card floating-card bg-info" ref="draggableCard" :style="{ display: mostrarFormulario ? 'block' : 'none' }">
      <div class="card-header text-white">Registro de Docentes</div>
      <div class="card-body overflow-auto" style="max-height: 550px; background-color: #fff;">
        <h5 class="card-title">Formulario de Registro de Docentes</h5>

        <form id="fmrRegistroDocentes" @submit.prevent="registrarDocente" @reset.prevent="cancelarFormulario">

          <div class="mb-3">
            <label class="form-label">Nombre:</label>
            <input type="text" class="form-control" placeholder="Ingresa el nombre" v-model="form.nombre">
          </div>

          <div class="mb-3">
            <label class="form-label">Código:</label>
            <input type="text" class="form-control" placeholder="Ej: ABCD123456" v-model="form.codigo" :readonly="editingId !== null" :class="{ 'bg-light': editingId !== null }">
          </div>

          <div class="mb-3">
            <label class="form-label">DUI:</label>
            <input type="text" class="form-control" placeholder="ejemplo: 12345678-9" v-model="form.dui">
          </div>

          <div class="mb-3">
            <label class="form-label">Email:</label>
            <input type="email" class="form-control" placeholder="correo@ejemplo.com" v-model="form.email">
          </div>

          <div class="mb-3">
            <label class="form-label">Teléfono:</label>
            <input type="text" class="form-control" placeholder="ejemplo: 1234-5678" v-model="form.telefono">
          </div>

          <div class="mb-3">
            <label class="form-label">Dirección:</label>
            <input type="text" class="form-control" placeholder="Ingresa la dirección" v-model="form.direccion">
          </div>

          <div class="mb-3">
            <label class="form-label">Escalafón:</label>
            <select class="form-select" v-model="form.escalafon">
              <option value="">Selecciona el grado</option>
              <option value="1">Grado 1</option>
              <option value="2">Grado 2</option>
              <option value="3">Grado 3</option>
              <option value="4">Grado 4</option>
              <option value="5">Grado 5</option>
              <option value="6">Grado 6</option>
            </select>
          </div>

          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-primary">Registrar</button>
            <button type="reset" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="floating-table" ref="draggableTable">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="mb-0 drag-handle" id="tableHandle">Lista de Docentes</h5>
        <div class="input-group w-50">
          <input type="text" class="form-control" placeholder="Buscar por nombre, código o DUI" v-model="buscar">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
        </div>
      </div>

      <div class="table-scroll-wrap" id="tableScrollWrap">
        <table id="tblDocentes" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>DUI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Escalafón</th>
              <th>Dirección</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in docentesFiltrados" :key="d.idDocente" @click="seleccionarDocente(d)" style="cursor: pointer;">
              <td>{{ d.codigo }}</td>
              <td>{{ d.nombre }}</td>
              <td>{{ d.dui }}</td>
              <td>{{ d.telefono }}</td>
              <td>{{ d.email }}</td>
              <td>Grado {{ d.escalafon }}</td>
              <td>{{ d.direccion }}</td>
              <td>
                <button type="button" class="btn btn-danger btn-sm btn-del" @click="eliminarDocente(d.idDocente, $event)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-end">
        <button class="btn btn-success mt-3" @click="mostrarFormulario = true">
          Registrar Docente
        </button>
      </div>
    </div>
  `
};