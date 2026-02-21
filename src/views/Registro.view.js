import { getDepartamentos, getMunicipios } from "../services/departamentos.js";
import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const RegistroView = {
  data() {
    return {
      cargandoEdicion: false,
      mostrarFormulario: false,
      editingId: null,
      buscar: "",
      departamentos: [],
      municipios: [],
      alumnos: [],
      form: {
        nombre: "",
        codigo: "",
        departamento: "",
        municipio: "",
        fechaNacimiento: "",
        telefono: "",
        direccion: "",
        sexo: ""
      }
    };
  },

  computed: {
    alumnosFiltrados() {
      const texto = (this.buscar || "").trim().toUpperCase();
      if (!texto) return this.alumnos;
      const palabras = texto.split(/\s+/).filter(Boolean);

      return this.alumnos.filter((a) => {
        if (!a?.codigo || !a?.departamento || !a?.nombre) return false;
        const contenido = `${a.codigo} ${a.departamento} ${a.nombre}`.toUpperCase();
        return palabras.every(p => contenido.includes(p));
      });
    }
  },

  watch: {
    "form.codigo"(val) {
      if (this.editingId !== null) return;
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

    "form.departamento"(depto) {
      this.municipios = getMunicipios(depto);
      if (!this.cargandoEdicion) this.form.municipio = "";
    }
  },

  methods: {
    initDepartamentos() {
      this.departamentos = getDepartamentos();
    },

    async cargarAlumnos() {
      this.alumnos = await db.alumnos.toArray();
    },

    seleccionarAlumno(a) {
      this.editingId = a.id;
      this.cargandoEdicion = true;

      this.form = {
        nombre: a.nombre ?? "",
        codigo: a.codigo ?? "",
        departamento: a.departamento ?? "",
        municipio: "",
        fechaNacimiento: a.fechaNacimiento ?? "",
        telefono: a.telefono ?? "",
        direccion: a.direccion ?? "",
        sexo: a.sexo ?? ""
      };

      this.municipios = getMunicipios(this.form.departamento);
      this.form.municipio = a.municipio ?? "";

      this.mostrarFormulario = true;
      this.$nextTick(() => (this.cargandoEdicion = false));
    },

    async eliminarAlumno(id, e) {
      if (e) e.stopPropagation();

      // Validar si el alumno tiene matrículas activas
      const matriculasActivas = await db.matricula
        .where("id")
        .equals(id)
        .filter(m => m.estado === "Activo")
        .count();

      if (matriculasActivas > 0) {
        if (window.alertify) {
          alertify.error("No se puede eliminar el alumno porque tiene una matrícula en estado Activo.");
        } else {
          alert("No se puede eliminar el alumno porque tiene una matrícula en estado Activo.");
        }
        return;
      }

      if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;

      await db.alumnos.delete(id);
      await this.cargarAlumnos();

      if (this.editingId === id) this.cancelarFormulario();
      if (window.alertify) alertify.success("Alumno eliminado");
    },

    async buscarAlumnoPorCodigo(codigo, ignoreId = null) {
      const code = (codigo ?? "").trim().toUpperCase();
      const found = await db.alumnos.where("codigo").equals(code).first();
      if (!found) return null;
      if (ignoreId && found.id === ignoreId) return null;
      return found;
    },

    generarId() {
      return Date.now().toString();
    },

    async registrarAlumno() {
      const esNuevo = this.editingId === null;

      const codigo = (this.form.codigo || "").trim().toUpperCase();
      const nombre = (this.form.nombre || "").trim();
      const telefono = (this.form.telefono || "").trim();
      const direccion = (this.form.direccion || "").trim();
      const departamento = this.form.departamento || "";
      const municipio = this.form.municipio || "";
      const fechaNacimiento = this.form.fechaNacimiento || "";
      const sexo = this.form.sexo || "";

      if (!codigo || !nombre || !departamento || !municipio || !fechaNacimiento || !sexo || !telefono || !direccion) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (!/^[A-Z]{4}[0-9]{6}$/.test(codigo)) {
        alert("Código inválido. Debe ser 4 letras y 6 números (ej: USSS037323).");
        return;
      }

      if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
        alert("Teléfono inválido. Debe ser formato 1234-5678.");
        return;
      }

      if (esNuevo) {
        const existente = await this.buscarAlumnoPorCodigo(codigo, null);
        if (existente) {
          alert(`El código ya existe: ${existente.nombre}`);
          return;
        }
      } else {
        // en edición, validar que no choque con otro
        const choque = await this.buscarAlumnoPorCodigo(codigo, this.editingId);
        if (choque) {
          alert(`El código ya existe: ${choque.nombre}`);
          return;
        }
      }

      const id = this.editingId ?? this.generarId();

      const alumno = {
        id,
        codigo,
        nombre,
        telefono,
        direccion,
        departamento,
        municipio,
        fechaNacimiento,
        sexo
      };

      const sha256 = CryptoJS.SHA256;
      alumno.hash = sha256(JSON.stringify(alumno)).toString();

      // put = inserta o actualiza por PK
      await db.alumnos.put(alumno);

      await this.cargarAlumnos();
      this.cancelarFormulario();

      if (window.alertify) {
        alertify.success(esNuevo ? "Alumno guardado" : "Alumno actualizado");
      }
    },

    cancelarFormulario() {
      this.editingId = null;
      this.form = {
        nombre: "",
        codigo: "",
        departamento: "",
        municipio: "",
        fechaNacimiento: "",
        telefono: "",
        direccion: "",
        sexo: ""
      };
      this.mostrarFormulario = false;
    }
  },


  async mounted() {
    this.initDepartamentos();

    await initDb();
    await this.cargarAlumnos();

    makeDraggable(this.$refs.draggableCard, ".card-header");
    makeDraggable(this.$refs.draggableTable, ".drag-handle");
  },

  template: `

<!-- CARD FORM -->
    <div class="card floating-card bg-warning" ref="draggableCard" :style="{ display: mostrarFormulario ? 'block' : 'none' }">
      <div class="card-header">Registro de Alumnos</div>
      <div class="card-body overflow-auto" style="max-height: 550px;">
        <h5 class="card-title">Formulario de Registro Académico</h5>

        <form id="fmrRegistroAlumnos" @submit.prevent="registrarAlumno" @reset.prevent="cancelarFormulario">

          <div class="mb-3">
            <label class="form-label">Nombre:</label>
            <input type="text" class="form-control" id="txtnombreAlumno" placeholder="Ingresa tu nombre" v-model="form.nombre">
          </div>

          <div class="mb-3">
            <label class="form-label">Código:</label>
            <input type="text" class="form-control" id="txtCodigo" placeholder="Ingresa tu código" v-model="form.codigo" :readonly="editingId !== null" :class="{ 'bg-light': editingId !== null }">
          </div>

          <div class="mb-3">
            <label class="form-label">Departamento:</label>
            <select class="form-select" id="selectDepartamento" v-model="form.departamento" @change="onDepartamentoChange">
              <option value="">Selecciona un departamento</option>
              <option v-for="d in departamentos" :key="d.value ?? d" :value="d.value ?? d">
                {{ d.label ?? d }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Municipio:</label>
            <select class="form-select" id="selectMunicipio" v-model="form.municipio">
              <option value="">Selecciona un municipio</option>
              <option v-for="m in municipios" :key="m.value ?? m" :value="m.value ?? m">
                {{ m.label ?? m }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Fecha de Nacimiento:</label>
            <input type="date" class="form-control" id="txtFechaNacimiento" v-model="form.fechaNacimiento">
          </div>

          <div class="mb-3">
            <label class="form-label">Teléfono:</label>
            <input type="text" class="form-control" id="txtTelefono" placeholder="Ingresa tu teléfono" v-model="form.telefono">
          </div>

          <div class="mb-3">
            <label class="form-label">Dirección:</label>
            <input type="text" class="form-control" id="txtdireccion" placeholder="Ingresa tu dirección" v-model="form.direccion">
          </div>

          <div class="mb-3">
            <label class="form-label">Sexo:</label><br>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="sexo" id="sexoF" value="Femenino" v-model="form.sexo">
              <label class="form-check-label" for="sexoF">Femenino</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="sexo" id="sexoM" value="Masculino" v-model="form.sexo">
              <label class="form-check-label" for="sexoM">Masculino</label>
            </div>
          </div>

          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-primary">Registrar</button>
            <button type="reset" class="btn btn-secondary">Cancelar</button>
         
          </div>
        </form>
      </div>
    </div>

    <!-- TABLA LISTA DE ALUMNOS -->
    <div class="floating-table" ref="draggableTable">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="mb-0 drag-handle" id="tableHandle">Lista de Alumnos</h5>
        <div class="input-group w-50">
          <input type="text" class="form-control" id="txtBarradeBusqueda" placeholder="Buscar por código y departamento" v-model="buscar" @input="filtrarAlumnos">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
        </div>
      </div>

      <div class="table-scroll-wrap" id="tableScrollWrap">
        <table id="tblAlumnos" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Departamento</th>
              <th>Municipio</th>
              <th>Fecha</th>
              <th>Sexo</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in alumnosFiltrados" :key="a.id" @click="seleccionarAlumno(a)">
              <td>{{ a.nombre }}</td>
              <td>{{ a.codigo }}</td>
              <td>{{ a.departamento }}</td>
              <td>{{ a.municipio }}</td>
              <td>{{ a.fechaNacimiento }}</td>
              <td>{{ a.sexo }}</td>
              <td>{{ a.telefono }}</td>
              <td>{{ a.direccion }}</td>
              <td>
                <button type="button" class="btn btn-danger btn-del" @click="eliminarAlumno(a.id, $event)">DEL</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-end">
        <button class="btn btn-success mt-3" @click="mostrarFormulario = true">
          Registrar
        </button>
      </div>
    </div>

  </div>
  
  `
};
