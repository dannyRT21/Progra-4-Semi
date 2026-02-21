import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const RegistroMatriculasView = {
  data() {
    return {
      mostrarFormulario: false,
      editingId: null,
      buscar: "", // Barra de búsqueda de la tabla
      buscarAlumno: "", // Buscador de alumnos en el form
      alumnos: [],
      matriculas: [],
      carreras: [
        "Ingeniería en Sistemas Computacionales", "Ingeniería de Software",
        "Ingeniería en Ciberseguridad", "Ingeniería en Redes",
        "Ingeniería en IA", "Lic. en Informática Educativa",
        "Lic. en Ciencias de la Computación", "Lic. en Gestión de TI",
        "Lic. en Diseño Web", "Lic. en Análisis de Datos",
        "Técnico en Ingeniería de Sistemas", "Técnico en Apps Móviles",
        "Técnico en Ciberseguridad", "Técnico en Mantenimiento",
        "Técnico en Programación"
      ],
      form: {
        id: "", 
        nombreAlumno: "", 
        fechaMatricula: new Date().toISOString().substr(0, 10),
        ciclo: "",
        estado: true,
        carrera: "",
        ingreso: "Nuevo"
      }
    };
  },

  computed: {
    // Filtrado de la tabla principal por Carrera o Nombre de Alumno
    matriculasFiltradas() {
      const texto = this.buscar.toLowerCase().trim();
      return this.matriculas.map(m => {
        const alumno = this.alumnos.find(a => a.id === m.id);
        return {
          ...m,
          nombreAlumno: alumno ? alumno.nombre : "Desconocido",
          codigoAlumno: alumno ? alumno.codigo : "N/A"
        };
      }).filter(m => 
        m.nombreAlumno.toLowerCase().includes(texto) || 
        m.carrera.toLowerCase().includes(texto) ||
        m.codigoAlumno.toLowerCase().includes(texto)
      );
    },

    // Buscador interno del formulario
    alumnosSugeridos() {
      const query = this.buscarAlumno.trim().toUpperCase();
      if (!query) return [];
      return this.alumnos.filter(a => 
        a.nombre.toUpperCase().includes(query) || a.codigo.toUpperCase().includes(query)
      ).slice(0, 5);
    }
  },

  methods: {
    async cargarDatos() {
      this.alumnos = await db.alumnos.toArray();
      this.matriculas = await db.matricula.toArray();
    },

    seleccionarAlumnoBusqueda(a) {
      this.form.id = a.id;
      this.form.nombreAlumno = `${a.codigo} - ${a.nombre}`;
      this.buscarAlumno = "";
    },

    async eliminarMatricula(id, e) {
      if (e) e.stopPropagation();
      if (!confirm("¿Deseas eliminar este registro de matrícula?")) return;
      await db.matricula.delete(id);
      await this.cargarDatos();
      if (window.alertify) alertify.error("Matrícula eliminada");
    },

    async registrarMatricula() {
      if (!this.form.id || !this.form.ciclo || !this.form.carrera) {
        alert("Por favor completa los campos obligatorios");
        return;
      }

      // Validación 6 meses
      const seisMeses = 6 * 30 * 24 * 60 * 60 * 1000;
      const ahora = new Date(this.form.fechaMatricula).getTime();
      const previas = await db.matricula.where("id").equals(this.form.id).toArray();
      
      const existeChoque = previas.some(m => {
        if (this.editingId && m.idMatricula === this.editingId) return false;
        return Math.abs(ahora - new Date(m.fechaMatricula).getTime()) < seisMeses;
      });

      if (existeChoque) {
        alert("El alumno ya posee una matrícula en un periodo cercano a 6 meses.");
        return;
      }

      const datos = {
        id: this.form.id,
        fechaMatricula: this.form.fechaMatricula,
        ciclo: this.form.ciclo,
        carrera: this.form.carrera,
        ingreso: this.form.ingreso,
        estado: this.form.estado ? "Activo" : "Inactivo",
        hash: Date.now()
      };

      if (this.editingId) datos.idMatricula = this.editingId;

      await db.matricula.put(datos);
      await this.cargarDatos();
      this.cancelarFormulario();
      if (window.alertify) alertify.success("Registro guardado");
    },

    seleccionarParaEditar(m) {
      this.editingId = m.idMatricula;
      const alumno = this.alumnos.find(a => a.id === m.id);
      this.form = {
        id: m.id,
        nombreAlumno: alumno ? `${alumno.codigo} - ${alumno.nombre}` : "",
        fechaMatricula: m.fechaMatricula,
        ciclo: m.ciclo,
        carrera: m.carrera,
        ingreso: m.ingreso,
        estado: m.estado === "Activo"
      };
      this.mostrarFormulario = true;
    },

    cancelarFormulario() {
      this.editingId = null;
      this.form = { id: "", nombreAlumno: "", fechaMatricula: new Date().toISOString().substr(0, 10), ciclo: "", carrera: "", ingreso: "Nuevo", estado: true };
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
  <div id="registroMatriculas" style="font-family: 'Segoe UI', sans-serif;">
    
    <div class="card floating-card" ref="draggableCard" 
         :style="{ display: mostrarFormulario ? 'block' : 'none', backgroundColor: '#fce4ec', border: '2px solid #f8bbd0', width: '450px' }">
      <div class="card-header" style="background-color: #f8bbd0; color: #880e4f; font-weight: bold; cursor: move;">
        Formulario de Matrícula
      </div>
      <div class="card-body overflow-auto" style="max-height: 550px; background-color: #fffafb;">
        
        <form @submit.prevent="registrarMatricula" @reset.prevent="cancelarFormulario">
          
          <div class="mb-3">
            <label class="form-label">Buscar Alumno:</label>
            <input type="text" class="form-control" v-model="buscarAlumno" placeholder="Escribe nombre o código...">
            <ul class="list-group mt-1" v-if="alumnosSugeridos.length">
              <li v-for="a in alumnosSugeridos" :key="a.id" 
                  class="list-group-item list-group-item-action py-1" 
                  @click="seleccionarAlumnoBusqueda(a)" style="cursor:pointer; font-size: 0.85rem;">
                {{ a.codigo }} | {{ a.nombre }}
              </li>
            </ul>
            <div v-if="form.nombreAlumno" class="mt-2 p-2 rounded" style="background-color: #fce4ec; color: #c2185b; font-size: 0.9rem;">
              <strong>Seleccionado:</strong> {{ form.nombreAlumno }}
            </div>
          </div>

          <div class="row">
            <div class="col-6 mb-3">
              <label class="form-label">Fecha:</label>
              <input type="date" class="form-control" v-model="form.fechaMatricula">
            </div>
            <div class="col-6 mb-3">
              <label class="form-label">Ciclo:</label>
              <select class="form-select" v-model="form.ciclo">
                <option value="">Seleccionar</option>
                <option value="Ciclo 01">Ciclo 01</option>
                <option value="Ciclo 02">Ciclo 02</option>
                <option value="Ciclo 03">Ciclo 03</option>
                <option value="Ciclo 04">Ciclo 04</option>
                <option value="Ciclo 05">Ciclo 05</option>
                <option value="Ciclo 06">Ciclo 06</option>
                <option value="Ciclo 07">Ciclo 07</option>
                <option value="Ciclo 08">Ciclo 08</option>
                <option value="Ciclo 09">Ciclo 09</option>
                <option value="Ciclo 10">Ciclo 10</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Carrera:</label>
            <select class="form-select" v-model="form.carrera">
              <option value="">Selecciona la carrera de interes</option>
              <option v-for="c in carreras" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label d-block">Tipo de Ingreso:</label>
            <div class="btn-group w-100">
              <input type="radio" class="btn-check" id="ingNuevo" value="Nuevo" v-model="form.ingreso">
              <label class="btn btn-outline-danger" for="ingNuevo" style="border-color: #f8bbd0;">Nuevo</label>
              <input type="radio" class="btn-check" id="ingAntiguo" value="Antiguo" v-model="form.ingreso">
              <label class="btn btn-outline-danger" for="ingAntiguo" style="border-color: #f8bbd0;">Antiguo</label>
            </div>
          </div>

          <div class="mb-3 d-flex align-items-center">
            <label class="form-label me-3">Estado: <strong>{{ form.estado ? 'Activo' : 'Inactivo' }}</strong></label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" v-model="form.estado" style="cursor:pointer;">
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button type="submit" class="btn" style="background-color: #f06292; color: white;">Guardar</button>
            <button type="reset" class="btn btn-outline-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="floating-table" ref="draggableTable" style="border: 2px solid #f8bbd0; border-radius: 8px;">
      <div class="d-flex align-items-center justify-content-between mb-2 p-2" style="background-color: #fce4ec;">
        <h5 class="mb-0 drag-handle" style="color: #880e4f;">🌸 Registro de Matrículas</h5>
        <div class="input-group w-50">
          <input type="text" class="form-control" placeholder="Buscar registros..." v-model="buscar">
          <span class="input-group-text" style="background-color: #f8bbd0;"><i class="bi bi-search"></i></span>
        </div>
      </div>

      <div class="table-scroll-wrap p-2" style="background-color: white;">
        <table class="table table-hover align-middle">
          <thead style="background-color: #f8bbd0; color: #880e4f;">
            <tr>
              <th>Alumno</th>
              <th>Carrera</th>
              <th>Ciclo</th>
              <th class="text-center">Ingreso</th>
              <th class="text-center">Estado</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in matriculasFiltradas" :key="m.idMatricula" @click="seleccionarParaEditar(m)" style="cursor: pointer;">
              <td style="font-size: 0.85rem;"><strong>{{ m.codigoAlumno }}</strong><br>{{ m.nombreAlumno }}</td>
              <td style="font-size: 0.8rem;">{{ m.carrera }}</td>
              <td>{{ m.ciclo }}</td>
              
              <td class="text-center">
                <span class="btn btn-sm" style="width: 80px; pointer-events: none; border: 1px solid;"
                      :style="{ color: m.ingreso === 'Nuevo' ? '#0d6efd' : '#e91e63', borderColor: m.ingreso === 'Nuevo' ? '#0d6efd' : '#e91e63' }">
                  {{ m.ingreso }}
                </span>
              </td>

              <td class="text-center">
                <span class="btn btn-sm text-white" style="width: 80px; pointer-events: none;"
                      :style="{ backgroundColor: m.estado === 'Activo' ? '#198754' : '#9faee0ff' }">
                  {{ m.estado }}
                </span>
              </td>

              <td class="text-center">
                <button type="button" class="btn btn-danger btn-sm" style="width: 80px;" 
                        @click.stop="eliminarMatricula(m.idMatricula, $event)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-2 text-end" style="background-color: #fce4ec;">
        <button class="btn" style="background-color: #ec407a; color: white;" @click="mostrarFormulario = true">
          Nueva Matrícula
        </button>
      </div>
    </div>

  </div>
  `
};