import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const MateriasView = {
  data() {
    return {
      cargandoEdicion: false,
      mostrarFormulario: false,
      editingId: null,
      buscar: "",
      materias: [],
      docentes: [], // Para llenar el select de docentes
      form: {
        codigo: "",
        nombre: "",
        uv: "",
        idDocente: ""
      }
    };
  },

  computed: {
    materiasFiltradas() {
      const texto = (this.buscar || "").trim().toUpperCase();
      if (!texto) return this.materias;
      const palabras = texto.split(/\s+/).filter(Boolean);

      return this.materias.filter((m) => {
        const docente = this.docentes.find(d => d.idDocente === m.idDocente);
        const nombreDocente = docente ? docente.nombre : "";
        const contenido = `${m.codigo} ${m.nombre} ${nombreDocente}`.toUpperCase();
        return palabras.every(p => contenido.includes(p));
      });
    }
  },

  watch: {
    "form.codigo"(val) {
      if (this.editingId !== null) return;
      // Validación: 3 letras y 3 números (Ej: MAT101)
      const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const letras = v.replace(/[^A-Z]/g, "").slice(0, 3);
      const numeros = v.replace(/[^0-9]/g, "").slice(0, 3);
      const nuevo = letras + numeros;
      if (nuevo !== val) this.form.codigo = nuevo;
    }
  },

  methods: {
    async cargarDatos() {
      this.materias = await db.materias.toArray();
      this.docentes = await db.docentes.toArray();
    },

    getNombreDocente(id) {
      const d = this.docentes.find(doc => doc.idDocente === id);
      return d ? d.nombre : "No asignado";
    },

    seleccionarMateria(m) {
      this.editingId = m.idMateria;
      this.cargandoEdicion = true;

      this.form = {
        codigo: m.codigo ?? "",
        nombre: m.nombre ?? "",
        uv: m.uv ?? "",
        idDocente: m.idDocente ?? ""
      };

      this.mostrarFormulario = true;
      this.$nextTick(() => (this.cargandoEdicion = false));
    },

    async eliminarMateria(id, e) {
      if (e) e.stopPropagation();
      if (!confirm("¿Estás seguro de que deseas eliminar esta materia?")) return;

      await db.materias.delete(id);
      await this.cargarDatos();

      if (this.editingId === id) this.cancelarFormulario();
      if (window.alertify) alertify.error("Materia eliminada");
    },

    generarId() {
      return Date.now().toString();
    },

    async registrarMateria() {
  const esNuevo = this.editingId === null;

  // Limpieza de datos
  const codigo = (this.form.codigo || "").trim().toUpperCase();
  const nombre = (this.form.nombre || "").trim();
  const uv = this.form.uv; 
  const idDocente = this.form.idDocente;

  // REVISIÓN DE CAMPOS: Esto te dirá en consola cuál falta
  if (!codigo || !nombre || !uv || !idDocente) {
    console.log("Datos actuales:", { codigo, nombre, uv, idDocente }); // Depuración
    alert("Por favor, completa todos los campos.");
    return;
  }

  const idMateria = this.editingId ?? this.generarId();

  const materia = {
    idMateria,
    codigo,
    nombre,
    uv: parseInt(uv), // Aseguramos que sea entero
    idDocente
  };

  const sha256 = CryptoJS.SHA256;
  materia.hash = sha256(JSON.stringify(materia)).toString();

  try {
    await db.materias.put(materia);
    await this.cargarDatos();
    this.cancelarFormulario();
    if (window.alertify) alertify.success(esNuevo ? "Materia registrada" : "Materia actualizada");
  } catch (error) {
    console.error("Error al guardar en IndexDB:", error);
    alert("Error crítico al guardar en la base de datos.");
  }
    },

    cancelarFormulario() {
      this.editingId = null;
      this.form = { codigo: "", nombre: "", uv: "", idDocente: "" };
      this.mostrarFormulario = false;
    }
  },

  async mounted() {
    await initDb();
    await this.cargarDatos();

    makeDraggable(this.$refs.draggableCard, ".card-header");
    makeDraggable(this.$refs.draggableTable, ".drag-handle");
  },

  template: `
    <div class="card floating-card bg-primary" ref="draggableCard" :style="{ display: mostrarFormulario ? 'block' : 'none' }">
      <div class="card-header text-white">Registro de Materias</div>
      <div class="card-body overflow-auto" style="max-height: 550px; background-color: #fff;">
       <h5 class="card-title">Formulario de Registro de Materias</h5>
       
        <form @submit.prevent="registrarMateria" @reset.prevent="cancelarFormulario">

          <div class="mb-3">
            <label class="form-label">Nombre de la Materia:</label>
            <input type="text" class="form-control" v-model="form.nombre" placeholder="Ej: Programación I">
          </div>

          <div class="mb-3">
            <label class="form-label">Código:</label>
            <input type="text" class="form-control" v-model="form.codigo" placeholder="Ej: PRO101" :readonly="editingId !== null">
          </div>

          <div class="mb-3">
            <label class="form-label">UV (Unidades Valorativas):</label>
            <input type="number" class="form-control" v-model="form.uv" placeholder="Ej: 4">
          </div>

          <div class="mb-3">
            <label class="form-label">Docente Asignado:</label>
            <select class="form-select" v-model="form.idDocente">
              <option value="">Selecciona un docente</option>
              <option v-for="d in docentes" :key="d.idDocente" :value="d.idDocente">
                {{ d.nombre }} ({{ d.codigo }})
              </option>
            </select>
          </div>

          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-primary">{{ editingId ? 'Actualizar' : 'Registrar' }}</button>
            <button type="reset" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="floating-table" ref="draggableTable">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="mb-0 drag-handle">Lista de Materias</h5>
        <input type="text" class="form-control w-50" placeholder="Buscar materia o docente..." v-model="buscar">
      </div>

      <div class="table-scroll-wrap">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>UV</th>
              <th>Docente</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in materiasFiltradas" :key="m.idMateria" @click="seleccionarMateria(m)" style="cursor: pointer;">
              <td>{{ m.codigo }}</td>
              <td>{{ m.nombre }}</td>
              <td>{{ m.uv }}</td>
              <td>{{ getNombreDocente(m.idDocente) }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click.stop="eliminarMateria(m.idMateria)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-end">
        <button class="btn btn-success mt-3" @click="mostrarFormulario = true">Nueva Materia</button>
      </div>
    </div>
  `
};