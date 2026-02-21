import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const InscripcionesView = {
  data() {
    return {
      // ── Datos globales (cargados al montar) ──────────────────────────────
      todosAlumnos: [],
      todasMaterias: [],
      todosDocentes: [],
      todasMatriculas: [],
      todasInscripciones: [],

      // ── Buscador de alumno ───────────────────────────────────────────────
      buscarAlumno: "",
      alumnoSeleccionado: null,
      mostrarSugerencias: true,

      // ── Matrículas del alumno ────────────────────────────────────────────
      matriculasDelAlumno: [],
      matriculaSeleccionada: null,

      // ── Slots de materias ────────────────────────────────────────────────
      cantidadSlots: 1,
      slots: [{ materia: null, docente: null, confirmado: false }],

      // ── Modal de selección de materia ────────────────────────────────────
      modalSlotIndex: null,
      buscarMateriaModal: "",
      materiaPrevia: null,       // materia pendiente de confirmación

      // ── Modo edición ─────────────────────────────────────────────────────
      modoEdicion: false,
      eventoEnEdicion: null,     // { idMatricula, fechaInscripcion, filas[] }

      // ── Tabla de eventos ─────────────────────────────────────────────────
      buscarTabla: "",
      buscarFechaTabla: "",

      // ── Formulario visible ───────────────────────────────────────────────
      mostrarFormulario: false,

      // ── Alertas inline ───────────────────────────────────────────────────
      alertaMatricula: "",   // INS-01
      alertaSlots: "",       // INS-08
    };
  },

  computed: {
    // ── Sugerencias del buscador de alumno ───────────────────────────────
    alumnosSugeridos() {
      const q = this.buscarAlumno.trim().toUpperCase();
      if (!q || !this.mostrarSugerencias) return [];
      return this.todosAlumnos.filter(
        (a) =>
          a.nombre.toUpperCase().includes(q) ||
          a.codigo.toUpperCase().includes(q)
      ).slice(0, 6);
    },

    // ── Mostrar selector si tiene >1 matrícula ───────────────────────────
    mostrarSelectorMatricula() {
      return this.matriculasDelAlumno.length > 1;
    },

    // ── Estado de la matrícula activa ─────────────────────────────────────
    matriculaActiva() {
      return this.matriculaSeleccionada?.estado === "Activo";
    },

    // ── Materias disponibles para el modal (excluye ya seleccionadas) ─────
    materiasDisponibles() {
      const q = this.buscarMateriaModal.trim().toUpperCase();
      const usadas = this.slots
        .filter((s) => s.materia !== null)
        .map((s) => s.materia.idMateria);
      return this.todasMaterias.filter((m) => {
        if (usadas.includes(m.idMateria)) return false;
        if (!q) return true;
        return (
          m.nombre.toUpperCase().includes(q) ||
          m.codigo.toUpperCase().includes(q)
        );
      });
    },

    // ── Eventos agrupados de la matrícula seleccionada ────────────────────
    eventosAgrupados() {
      if (!this.matriculaSeleccionada) return [];
      return this._agruparInscripciones(this.matriculaSeleccionada.idMatricula);
    },

    // ── Eventos filtrados para la tabla ───────────────────────────────────
    eventosFiltrados() {
      const txt = this.buscarTabla.toLowerCase().trim();
      const fecha = this.buscarFechaTabla; // "yyyy-mm-dd"
      return this.eventosAgrupados.filter((ev) => {
        const mat = this.todasMatriculas.find(
          (m) => m.idMatricula === ev.idMatricula
        );
        const alumno = mat
          ? this.todosAlumnos.find((a) => a.id === mat.id)
          : null;
        const matchTxt =
          !txt ||
          alumno?.codigo.toLowerCase().includes(txt) ||
          alumno?.nombre.toLowerCase().includes(txt);
        const matchFecha =
          !fecha || ev.fechaInscripcion.startsWith(fecha);
        return matchTxt && matchFecha;
      });
    },

    // ── Metadatos del alumno para la tabla (join en memoria) ──────────────
    eventosConAlumno() {
      return this.eventosFiltrados.map((ev) => {
        const mat = this.todasMatriculas.find(
          (m) => m.idMatricula === ev.idMatricula
        );
        const alumno = mat
          ? this.todosAlumnos.find((a) => a.id === mat.id)
          : null;
        return {
          ...ev,
          nombreAlumno: alumno ? alumno.nombre : "—",
          codigoAlumno: alumno ? alumno.codigo : "—",
        };
      });
    },
  },

  methods: {
    // ═══════════════════════════════════════════════════════════════════════
    //  CARGA DE DATOS
    // ═══════════════════════════════════════════════════════════════════════
    async cargarDatosGlobales() {
      [
        this.todosAlumnos,
        this.todasMaterias,
        this.todosDocentes,
        this.todasMatriculas,
        this.todasInscripciones,
      ] = await Promise.all([
        db.alumnos.toArray(),
        db.materias.toArray(),
        db.docentes.toArray(),
        db.matricula.toArray(),
        db.inscripcion.toArray(),
      ]);
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  BUSCADOR DE ALUMNO
    // ═══════════════════════════════════════════════════════════════════════
    async seleccionarAlumno(alumno) {
      this.alumnoSeleccionado = alumno;
      this.buscarAlumno = `${alumno.codigo} – ${alumno.nombre}`;
      this.mostrarSugerencias = false;
      this.alertaMatricula = "";
      this.limpiarSlots();

      // Buscar todas las matrículas del alumno (índice "id")
      const mats = await db.matricula
        .where("id")
        .equals(alumno.id)
        .sortBy("idMatricula");

      this.matriculasDelAlumno = mats;

      if (mats.length === 0) {
        this.matriculaSeleccionada = null;
        this.alertaMatricula =
          "Este alumno no tiene ninguna matrícula registrada. Crea una en la vista Matrícula.";
        return;
      }

      // Preseleccionar: Activo más reciente, si no el más reciente
      const activas = mats.filter((m) => m.estado === "Activo");
      this.matriculaSeleccionada = activas.length
        ? activas[activas.length - 1]
        : mats[mats.length - 1];

      this._verificarEstadoMatricula();
    },

    limpiarBusqueda() {
      this.buscarAlumno = "";
      this.mostrarSugerencias = true;
      this.alumnoSeleccionado = null;
      this.matriculasDelAlumno = [];
      this.matriculaSeleccionada = null;
      this.alertaMatricula = "";
      this.limpiarSlots();
      this.modoEdicion = false;
      this.eventoEnEdicion = null;
    },

    seleccionarMatricula(idMatricula) {
      const m = this.matriculasDelAlumno.find(
        (m) => m.idMatricula === Number(idMatricula)
      );
      if (m) {
        this.matriculaSeleccionada = m;
        this._verificarEstadoMatricula();
        this.limpiarSlots();
      }
    },

    _verificarEstadoMatricula() {
      if (this.matriculaSeleccionada?.estado !== "Activo") {
        this.alertaMatricula =
          "⚠️ La matrícula seleccionada está Inactiva. No se pueden inscribir materias hasta que se reactive en la vista Matrícula.";
      } else {
        this.alertaMatricula = "";
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  SLOTS DE MATERIAS
    // ═══════════════════════════════════════════════════════════════════════
    setCantidad(n) {
      n = Number(n);
      const sobrantes = this.slots
        .slice(n)
        .filter((s) => s.materia !== null).length;
      if (sobrantes > 0) {
        const ok = confirm(
          `Vas a perder ${sobrantes} selección(es) al reducir los slots. ¿Continuar?`
        );
        if (!ok) {
          // Revertir el select al valor anterior
          this.$nextTick(() => {
            this.cantidadSlots = this.slots.length;
          });
          return;
        }
      }
      this.cantidadSlots = n;
      this.slots = this.slots.slice(0, n);
      while (this.slots.length < n)
        this.slots.push({ materia: null, docente: null, confirmado: false });
    },

    limpiarSlots() {
      this.cantidadSlots = 1;
      this.slots = [{ materia: null, docente: null, confirmado: false }];
      this.alertaSlots = "";
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  MODAL DE SELECCIÓN DE MATERIA
    // ═══════════════════════════════════════════════════════════════════════
    abrirModalMateria(index) {
      this.modalSlotIndex = index;
      this.buscarMateriaModal = "";
      this.materiaPrevia = null;
      const modal = new bootstrap.Modal(
        document.getElementById("modalSeleccionMateria")
      );
      modal.show();
    },

    preSeleccionarMateria(mat) {
      // Verificar duplicado
      const yaUsado = this.slots.some(
        (s, i) => i !== this.modalSlotIndex && s.materia?.idMateria === mat.idMateria
      );
      if (yaUsado) {
        const slotN =
          this.slots.findIndex(
            (s, i) => i !== this.modalSlotIndex && s.materia?.idMateria === mat.idMateria
          ) + 1;
        alert(`🚫 Esta materia ya está asignada en el slot ${slotN}. Elige una diferente.`);
        return;
      }
      const docente = this.todosDocentes.find(
        (d) => d.idDocente === mat.idDocente
      );
      this.materiaPrevia = { materia: mat, docente };
    },

    confirmarMateria() {
      if (!this.materiaPrevia) return;
      const { materia, docente } = this.materiaPrevia;
      this.slots[this.modalSlotIndex] = { materia, docente, confirmado: true };
      this.materiaPrevia = null;
      bootstrap.Modal.getInstance(
        document.getElementById("modalSeleccionMateria")
      )?.hide();
    },

    cancelarModal() {
      this.materiaPrevia = null;
      bootstrap.Modal.getInstance(
        document.getElementById("modalSeleccionMateria")
      )?.hide();
    },

    quitarMateria(index) {
      // En modo edición: verificar si es la última
      if (this.modoEdicion) {
        const confirmadas = this.slots.filter((s) => s.confirmado).length;
        if (confirmadas <= 1 && this.matriculaActiva) {
          alert(
            "🚫 No puedes eliminar la última materia de este evento mientras la matrícula esté Activa. Ve a la vista Matrícula para desactivarla primero."
          );
          return;
        }
      }
      this.slots[index] = { materia: null, docente: null, confirmado: false };
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  GUARDAR EVENTO
    // ═══════════════════════════════════════════════════════════════════════
    async guardarEvento() {
      this.alertaSlots = "";
      const confirmadas = this.slots.filter((s) => s.confirmado && s.materia);
      if (confirmadas.length === 0) {
        this.alertaSlots = "⚠️ Selecciona al menos una materia antes de guardar.";
        return;
      }

      if (this.modoEdicion && this.eventoEnEdicion) {
        await this._guardarEdicion(confirmadas);
      } else {
        await this._guardarNuevo(confirmadas);
      }
    },

    async _guardarNuevo(confirmadas) {
      const fechaEvento = new Date().toISOString();
      const filas = confirmadas.map((s) => ({
        idMatricula: this.matriculaSeleccionada.idMatricula,
        idMateria: s.materia.idMateria,
        fechaInscripcion: fechaEvento,
      }));
      await db.inscripcion.bulkAdd(filas);
      // Actualizar caché local
      const insertadas = await db.inscripcion
        .where("idMatricula")
        .equals(this.matriculaSeleccionada.idMatricula)
        .and((i) => i.fechaInscripcion === fechaEvento)
        .toArray();
      this.todasInscripciones.push(...insertadas);

      if (window.alertify)
        alertify.success(
          `Inscripción guardada — ${filas.length} materia(s) registrada(s).`
        );
      this.limpiarSlots();
    },

    async _guardarEdicion(confirmadas) {
      const ev = this.eventoEnEdicion;
      // Materias actuales en DB para este evento
      const actualesIds = ev.filas.map((f) => f.idInscripcion);
      const nuevasIds = confirmadas.map((s) => s.materia.idMateria);

      // Borrar las que se quitaron
      const borrar = ev.filas.filter(
        (f) => !confirmadas.some((s) => s.materia.idMateria === f.idMateria)
      );
      // Agregar las nuevas
      const agregar = confirmadas.filter(
        (s) => !ev.filas.some((f) => f.idMateria === s.materia.idMateria)
      );

      if (borrar.length > 0) {
        const idsBorrar = borrar.map((f) => f.idInscripcion);
        await db.inscripcion.bulkDelete(idsBorrar);
        this.todasInscripciones = this.todasInscripciones.filter(
          (i) => !idsBorrar.includes(i.idInscripcion)
        );
      }
      if (agregar.length > 0) {
        const filas = agregar.map((s) => ({
          idMatricula: ev.idMatricula,
          idMateria: s.materia.idMateria,
          fechaInscripcion: ev.fechaInscripcion,
        }));
        await db.inscripcion.bulkAdd(filas);
        const recien = await db.inscripcion
          .where("idMatricula")
          .equals(ev.idMatricula)
          .and((i) => i.fechaInscripcion === ev.fechaInscripcion)
          .toArray();
        // Quitar duplicados y agregar solo los que no están
        const existentes = new Set(
          this.todasInscripciones.map((i) => i.idInscripcion)
        );
        recien.forEach((i) => {
          if (!existentes.has(i.idInscripcion))
            this.todasInscripciones.push(i);
        });
      }

      if (window.alertify)
        alertify.success("Inscripción actualizada.");
      this.cancelarFormulario();
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  TABLA: CARGAR EVENTO EN EDICIÓN
    // ═══════════════════════════════════════════════════════════════════════
    async cargarEventoEdicion(ev) {
      // Buscar matrícula y alumno
      const mat = this.todasMatriculas.find(
        (m) => m.idMatricula === ev.idMatricula
      );
      const alumno = mat
        ? this.todosAlumnos.find((a) => a.id === mat.id)
        : null;
      if (!alumno || !mat) return;

      this.alumnoSeleccionado = alumno;
      this.buscarAlumno = `${alumno.codigo} – ${alumno.nombre}`;
      this.mostrarSugerencias = false;

      this.matriculasDelAlumno = await db.matricula
        .where("id")
        .equals(alumno.id)
        .sortBy("idMatricula");
      this.matriculaSeleccionada = mat;
      this._verificarEstadoMatricula();

      // Cargar slots con las materias del evento
      const filas = ev.filas;
      this.cantidadSlots = filas.length;
      this.slots = filas.map((f) => {
        const materia = this.todasMaterias.find(
          (m) => m.idMateria === f.idMateria
        );
        const docente = materia
          ? this.todosDocentes.find((d) => d.idDocente === materia.idDocente)
          : null;
        return { materia, docente, confirmado: true };
      });

      this.modoEdicion = true;
      this.eventoEnEdicion = ev;
      this.mostrarFormulario = true;
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  ELIMINAR EVENTO
    // ═══════════════════════════════════════════════════════════════════════
    async eliminarEvento(ev, e) {
      if (e) e.stopPropagation();

      // Verificar si la matrícula es Activa y este es el único evento con materias
      const mat = this.todasMatriculas.find(
        (m) => m.idMatricula === ev.idMatricula
      );
      if (mat?.estado === "Activo" && ev.filas.length >= 1) {
        const todosEventos = this._agruparInscripciones(ev.idMatricula);
        if (todosEventos.length === 1) {
          alert(
            "🚫 No puedes eliminar la última inscripción mientras la matrícula esté Activa. Ve a la vista Matrícula para desactivarla primero."
          );
          return;
        }
      }

      const fechaLegible = this._formatFecha(ev.fechaInscripcion);
      if (
        !confirm(
          `¿Eliminar todas las materias de la inscripción del ${fechaLegible}?`
        )
      )
        return;

      const ids = ev.filas.map((f) => f.idInscripcion);
      await db.inscripcion.bulkDelete(ids);
      this.todasInscripciones = this.todasInscripciones.filter(
        (i) => !ids.includes(i.idInscripcion)
      );
      if (window.alertify) alertify.error("Inscripción eliminada.");
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  CANCELAR / LIMPIAR FORMULARIO
    // ═══════════════════════════════════════════════════════════════════════
    cancelarFormulario() {
      this.modoEdicion = false;
      this.eventoEnEdicion = null;
      this.alertaSlots = "";
      this.limpiarSlots();
      this.mostrarFormulario = false;
    },

    abrirFormularioNuevo() {
      this.cancelarFormulario();
      this.mostrarFormulario = true;
    },

    // ═══════════════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════════════
    _agruparInscripciones(idMatricula) {
      const filas = this.todasInscripciones.filter(
        (i) => i.idMatricula === idMatricula
      );
      const mapa = new Map();
      for (const f of filas) {
        if (!mapa.has(f.fechaInscripcion)) mapa.set(f.fechaInscripcion, []);
        mapa.get(f.fechaInscripcion).push(f);
      }
      return [...mapa.entries()]
        .map(([fecha, fs]) => ({ idMatricula, fechaInscripcion: fecha, filas: fs }))
        .sort((a, b) => b.fechaInscripcion.localeCompare(a.fechaInscripcion));
    },

    formatFecha(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    getDocente(idDocente) {
      return this.todosDocentes.find((d) => d.idDocente === idDocente);
    },
  },


  async mounted() {
    await initDb();
    await this.cargarDatosGlobales();
    makeDraggable(this.$refs.draggableCard, ".card-header");
    makeDraggable(this.$refs.draggableTable, ".drag-handle");
  },


  // ═══════════════════════════════════════════════════════════════════════════
  //  TEMPLATE
  // ═══════════════════════════════════════════════════════════════════════════
  template: `
<div id="inscripciones" style="font-family:'Segoe UI',sans-serif;">

  <!-- ══════════════════════════════════════════════════════════════════════
       CARD FLOTANTE: FORMULARIO
  ══════════════════════════════════════════════════════════════════════ -->
  <div class="card floating-card" ref="draggableCard"
       :style="{ display: mostrarFormulario ? 'block' : 'none',
                 backgroundColor:'#e8f5e9', border:'2px solid #a5d6a7', width:'500px' }">

    <div class="card-header drag-handle d-flex justify-content-between align-items-center"
         style="background:#a5d6a7;color:#1b5e20;font-weight:bold;cursor:move;">
      <span>{{ modoEdicion ? '✏️ Editar Inscripción' : '📋 Nueva Inscripción' }}</span>
      <button type="button" class="btn-close btn-close-sm" @click="cancelarFormulario"></button>
    </div>

    <div class="card-body overflow-auto" style="max-height:600px;background:#f1f8f1;">

      <!-- ── Buscador de alumno ─────────────────────────────────────────── -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Alumno:</label>

        <div v-if="!alumnoSeleccionado">
          <input type="text" class="form-control" v-model="buscarAlumno"
                 @input="mostrarSugerencias=true"
                 placeholder="Escribe nombre o código del alumno…"
                 :disabled="modoEdicion" />
          <ul class="list-group mt-1 shadow-sm" v-if="alumnosSugeridos.length">
            <li v-for="a in alumnosSugeridos" :key="a.id"
                class="list-group-item list-group-item-action py-1"
                @click="seleccionarAlumno(a)"
                style="cursor:pointer;font-size:.85rem;">
              <strong>{{ a.codigo }}</strong> – {{ a.nombre }}
            </li>
          </ul>
        </div>

        <div v-else class="d-flex align-items-center gap-2 p-2 rounded"
             style="background:#c8e6c9;color:#1b5e20;font-size:.9rem;">
          <span>✔ <strong>{{ alumnoSeleccionado.codigo }}</strong> – {{ alumnoSeleccionado.nombre }}</span>
          <button v-if="!modoEdicion" type="button" class="btn btn-sm btn-outline-secondary ms-auto"
                  @click="limpiarBusqueda" title="Cambiar alumno">✕</button>
        </div>
      </div>

      <!-- ── Selector de matrícula (solo si >1) ────────────────────────── -->
      <div v-if="mostrarSelectorMatricula && alumnoSeleccionado" class="mb-3">
        <label class="form-label fw-semibold">Elegir matrícula:</label>
        <select class="form-select" :disabled="modoEdicion"
                :value="matriculaSeleccionada?.idMatricula"
                @change="seleccionarMatricula($event.target.value)">
          <option v-for="m in matriculasDelAlumno" :key="m.idMatricula" :value="m.idMatricula">
            {{ m.fechaMatricula }} · {{ m.ciclo }} · {{ m.carrera.split(' ').slice(0,2).join(' ') }}… · {{ m.estado }}
          </option>
        </select>
      </div>

      <!-- ── Panel resumen de matrícula ────────────────────────────────── -->
      <div v-if="matriculaSeleccionada" class="mb-3 p-2 rounded"
           style="background:#fff;border:1px solid #a5d6a7;font-size:.88rem;">
        <div class="row g-1">
          <div class="col-6"><strong>Carrera:</strong><br><span>{{ matriculaSeleccionada.carrera }}</span></div>
          <div class="col-3"><strong>Ciclo:</strong><br>{{ matriculaSeleccionada.ciclo }}</div>
          <div class="col-3"><strong>Ingreso:</strong><br>{{ matriculaSeleccionada.ingreso }}</div>
        </div>
        <div class="mt-1">
          <strong>Estado:</strong>
          <span class="badge ms-1" :style="{ backgroundColor: matriculaActiva ? '#198754' : '#9e9e9e' }">
            {{ matriculaSeleccionada.estado }}
          </span>
        </div>
      </div>

      <!-- ── Alerta de matrícula inactiva ─────────────────────────────── -->
      <div v-if="alertaMatricula" class="alert alert-warning py-2" style="font-size:.85rem;">
        {{ alertaMatricula }}
      </div>

      <!-- ══ SECCIÓN DE SLOTS (solo si matrícula Activa o modoEdición) ══ -->
      <div v-if="matriculaSeleccionada"
           :style="{ opacity: matriculaActiva ? 1 : 0.45, pointerEvents: matriculaActiva ? 'auto' : 'none' }">

        <!-- Selector de cantidad -->
        <div class="mb-3 d-flex align-items-center gap-2">
          <label class="form-label mb-0 fw-semibold">Nº de materias:</label>
          <select class="form-select form-select-sm" style="width:80px;"
                  :value="cantidadSlots" @change="setCantidad($event.target.value)"
                  :disabled="modoEdicion">
            <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <!-- Slots -->
        <div v-for="(slot, i) in slots" :key="i" class="mb-2">
          <div v-if="!slot.confirmado"
               class="d-flex align-items-center justify-content-between p-2 rounded"
               style="border:2px dashed #81c784;cursor:pointer;background:#f9fdf9;"
               @click="abrirModalMateria(i)">
            <span style="font-size:.85rem;color:#388e3c;">＋ Slot {{ i+1 }}: Pulsa aquí para seleccionar materia</span>
          </div>
          <div v-else class="d-flex align-items-center justify-content-between p-2 rounded"
               style="background:#c8e6c9;border:1px solid #81c784;font-size:.85rem;">
            <div>
              <strong>{{ slot.materia.codigo }}</strong> · {{ slot.materia.nombre }}
              · <span class="text-muted">{{ slot.materia.uv }} UV</span>
              · 👤 {{ slot.docente ? slot.docente.nombre : '–' }}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger ms-2"
                    @click="quitarMateria(i)">✕</button>
          </div>
        </div>

        <!-- Alerta slots -->
        <div v-if="alertaSlots" class="alert alert-warning py-1 mt-1" style="font-size:.83rem;">
          {{ alertaSlots }}
        </div>

        <!-- Botones del formulario -->
        <div class="d-flex justify-content-between mt-3">
          <button type="button" class="btn text-white"
                  style="background:#43a047;"
                  @click="guardarEvento">
            {{ modoEdicion ? '💾 Actualizar' : '💾 Guardar inscripción' }}
          </button>
          <button type="button" class="btn btn-outline-secondary"
                  @click="cancelarFormulario">Cancelar</button>
        </div>

      </div><!-- /bloque slots -->

    </div><!-- /card-body -->
  </div><!-- /card flotante -->


  <!-- ══════════════════════════════════════════════════════════════════════
       TABLA FLOTANTE: EVENTOS
  ══════════════════════════════════════════════════════════════════════ -->
  <div class="floating-table" ref="draggableTable"
       style="border:2px solid #a5d6a7;border-radius:8px;min-width:680px;">

    <div class="p-2 mb-2" style="background:#e8f5e9;">
      <h5 class="mb-0 drag-handle" style="color:#1b5e20;cursor:move;">🎓 Inscripciones</h5>
    </div>

    <div class="table-scroll-wrap px-2" style="background:white;">
      <table class="table table-hover align-middle" id="tblInscripciones">
        <thead style="background:#a5d6a7;color:#1b5e20;">
          <tr>
            <th>Estudiante</th>
            <th class="text-center"># Materias</th>
            <th>Fecha Inscripción</th>
            <th class="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!matriculaSeleccionada">
            <td colspan="4" class="text-center text-muted py-4" style="font-size:.9rem;">
              Selecciona un alumno en el formulario para ver sus inscripciones.
            </td>
          </tr>
          <tr v-else-if="eventosConAlumno.length === 0">
            <td colspan="4" class="text-center text-muted py-4" style="font-size:.9rem;">
              No hay inscripciones registradas para esta matrícula.
            </td>
          </tr>
          <tr v-for="ev in eventosConAlumno" :key="ev.fechaInscripcion + ev.idMatricula"
              @click="cargarEventoEdicion(ev)" style="cursor:pointer;">
            <td style="font-size:.85rem;">
              <strong>{{ ev.codigoAlumno }}</strong><br>
              <span style="color:#555;">{{ ev.nombreAlumno }}</span>
            </td>
            <td class="text-center">
              <span class="badge rounded-pill" style="background:#43a047;font-size:.9rem;">
                {{ ev.filas.length }}
              </span>
            </td>
            <td style="font-size:.85rem;">{{ formatFecha(ev.fechaInscripcion) }}</td>
            <td class="text-center">
              <button type="button" class="btn btn-danger btn-sm"
                      @click.stop="eliminarEvento(ev, $event)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="p-2 text-end" style="background:#e8f5e9;">
      <button class="btn text-white" style="background:#2e7d32;"
              @click="abrirFormularioNuevo">
        + Nueva Inscripción
      </button>
    </div>
  </div><!-- /tabla -->


  <!-- ══════════════════════════════════════════════════════════════════════
       MODAL: SELECCIÓN DE MATERIA
  ══════════════════════════════════════════════════════════════════════ -->
  <div class="modal fade" id="modalSeleccionMateria" tabindex="-1"
       aria-labelledby="modalMatLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header" style="background:#a5d6a7;color:#1b5e20;">
          <h5 class="modal-title" id="modalMatLabel">Seleccionar materia — Slot {{ (modalSlotIndex ?? 0) + 1 }}</h5>
          <button type="button" class="btn-close" @click="cancelarModal"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control mb-3"
                 placeholder="Buscar por nombre o código…"
                 v-model="buscarMateriaModal" />

          <!-- Lista de materias disponibles -->
          <div v-if="!materiaPrevia">
            <div v-if="materiasDisponibles.length === 0"
                 class="text-center text-muted py-3">Sin materias disponibles</div>
            <div v-for="m in materiasDisponibles" :key="m.idMateria"
                 class="p-2 mb-1 rounded"
                 style="border:1px solid #ddd;cursor:pointer;"
                 @click="preSeleccionarMateria(m)"
                 @mouseover="$event.target.closest('.p-2').style.background='#f1f8f1'"
                 @mouseout="$event.target.closest('.p-2').style.background=''">
              <strong>{{ m.codigo }}</strong> · {{ m.nombre }}
              · <span class="text-muted">{{ m.uv }} UV</span>
              · 👤 {{ getDocente(m.idDocente)?.nombre ?? '–' }}
            </div>
          </div>

          <!-- Confirmación de materia seleccionada -->
          <div v-else class="p-3 rounded" style="background:#e8f5e9;border:1px solid #a5d6a7;">
            <p class="mb-2 fw-semibold" style="color:#1b5e20;">Vas a inscribir:</p>
            <table class="table table-sm mb-3">
              <tbody>
                <tr><th>Nombre</th><td>{{ materiaPrevia.materia.nombre }}</td></tr>
                <tr><th>Código</th><td>{{ materiaPrevia.materia.codigo }}</td></tr>
                <tr><th>UV</th><td>{{ materiaPrevia.materia.uv }}</td></tr>
                <tr><th>Docente</th><td>{{ materiaPrevia.docente?.nombre ?? '–' }}</td></tr>
              </tbody>
            </table>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-success" @click="confirmarMateria">✔ Guardar materia</button>
              <button type="button" class="btn btn-outline-secondary" @click="materiaPrevia=null">↩ Cambiar</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="cancelarModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div><!-- /modal -->

</div>
  `,
};
