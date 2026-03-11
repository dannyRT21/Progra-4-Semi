import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const LecturasView = {
  data() {
    return {
      cargandoEdicion: false,
      mostrarFormulario: false,
      editingId: null,
      buscar: "",
      lecturas: [],
      clientes: [],
      form: {
        codigoCliente: "",
        cliente: "",
        fecha: "",
        lectura_anterior: "",
        lectura_actual: "",
        pago: ""
      }
    };
  },

  computed: {
    lecturasFiltradas() {
      const texto = (this.buscar || "").trim().toUpperCase();
      if (!texto) return this.lecturas;

      const palabras = texto.split(/\s+/).filter(Boolean);

      return this.lecturas.filter((l) => {
        const contenido = `${l.codigoCliente || ""} ${l.cliente || ""} ${l.fecha || ""} ${l.lectura_anterior || ""} ${l.lectura_actual || ""} ${l.pago || ""}`.toUpperCase();
        return palabras.every(p => contenido.includes(p));
      });
    }
  },

  watch: {
    "form.codigoCliente"(val) {
      if (this.editingId !== null) return;

      const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const letras = v.replace(/[^A-Z]/g, "").slice(0, 3);
      const numeros = v.replace(/[^0-9]/g, "").slice(0, 4);
      const nuevo = letras + numeros;

      if (nuevo !== val) {
        this.form.codigoCliente = nuevo;
        return;
      }

      this.autocompletarClientePorCodigo(nuevo);
    },



    "form.pago"(val) {
      const limpio = (val ?? "").toString().replace(/[^\d.]/g, "");
      if (limpio !== val) this.form.pago = limpio;
    }
  },

  methods: {
    fechaSistema() {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },

    async cargarLecturas() {
      this.lecturas = await db.lecturas.toArray();
    },

    async cargarClientes() {
      this.clientes = await db.clientes.toArray();
    },

    async autocompletarClientePorCodigo(codigo) {
      const code = (codigo || "").trim().toUpperCase();

      if (!code) {
        this.form.cliente = "";
        this.form.lectura_anterior = "";
        this.form.lectura_actual = "";
        return;
      }

      // 1. Siempre resolver el nombre del cliente primero
      const cliente = await db.clientes.where("codigo").equals(code).first();
      this.form.cliente = cliente ? cliente.nombre : "";

      if (!cliente) return;

      // 2. Buscar lecturas previas con manejo de error por si el índice no migró aún
      try {
        let lecturasCliente;
        try {
          // Intento rápido usando el índice codigoCliente
          lecturasCliente = await db.lecturas
            .where("codigoCliente")
            .equals(code)
            .toArray();
        } catch {
          // Fallback: escaneo manual si el índice aún no existe en este browser
          const todas = await db.lecturas.toArray();
          lecturasCliente = todas.filter(
            l => (l.codigoCliente || "").toUpperCase() === code
          );
        }

        if (lecturasCliente.length > 0) {
          const ultima = lecturasCliente.reduce((prev, curr) =>
            curr.idLectura > prev.idLectura ? curr : prev
          );
          this.form.lectura_anterior = ultima.lectura_actual ?? "";
          this.form.lectura_actual = "";
        } else {
          this.form.lectura_anterior = "";
          this.form.lectura_actual = "";
        }
      } catch {
        // Si todo falla, solo limpiar lecturas pero conservar el nombre
        this.form.lectura_anterior = "";
        this.form.lectura_actual = "";
      }
    },

    seleccionarLectura(l) {
      this.editingId = l.idLectura;
      this.cargandoEdicion = true;

      this.form = {
        codigoCliente: l.codigoCliente ?? "",
        cliente: l.cliente ?? "",
        fecha: l.fecha ?? this.fechaSistema(),
        lectura_anterior: l.lectura_anterior ?? "",
        lectura_actual: l.lectura_actual ?? "",
        pago: l.pago ?? ""
      };

      this.mostrarFormulario = true;
      this.$nextTick(() => (this.cargandoEdicion = false));
    },

    async eliminarLectura(id, e) {
      if (e) e.stopPropagation();
      if (!confirm("¿Estás seguro de que deseas eliminar esta lectura?")) return;

      await db.lecturas.delete(id);
      await this.cargarLecturas();

      if (this.editingId === id) this.cancelarFormulario();
      if (window.alertify) alertify.error("Lectura eliminada");
    },

    async registrarLectura() {
      const esNuevo = this.editingId === null;

      const codigoCliente = (this.form.codigoCliente || "").trim().toUpperCase();
      const fecha = this.form.fecha || this.fechaSistema();
      const lectura_anterior = (this.form.lectura_anterior ?? "").toString().trim();
      const lectura_actual = (this.form.lectura_actual ?? "").toString().trim();
      const pago = Number(this.form.pago);

      if (!codigoCliente || !lectura_anterior || !lectura_actual || isNaN(pago)) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (!/^[A-Z]{3}[0-9]{4}$/.test(codigoCliente)) {
        alert("Código de cliente inválido. Debe ser 3 letras y 4 números (ej: ABC1234).");
        return;
      }

      const clienteEncontrado = await db.clientes.where("codigo").equals(codigoCliente).first();

      if (!clienteEncontrado) {
        alert("No existe un cliente registrado con ese código.");
        return;
      }

      if (pago < 0) {
        alert("El pago no puede ser negativo.");
        return;
      }

      const lectura = {
        cliente: clienteEncontrado.nombre,
        codigoCliente,
        fecha,
        lectura_anterior: lectura_anterior,
        lectura_actual: lectura_actual,
        pago
      };

      if (!esNuevo) {
        lectura.idLectura = this.editingId;
      }

      await db.lecturas.put(lectura);

      await this.cargarLecturas();
      this.cancelarFormulario();

      if (window.alertify) {
        alertify.success(esNuevo ? "Lectura registrada" : "Lectura actualizada");
      }
    },

    cancelarFormulario() {
      this.editingId = null;
      this.form = {
        codigoCliente: "",
        cliente: "",
        fecha: this.fechaSistema(),
        lectura_anterior: "",
        lectura_actual: "",
        pago: ""
      };
      this.mostrarFormulario = false;
    }
  },

  async mounted() {
    await initDb();
    await this.cargarClientes();
    await this.cargarLecturas();

    this.form.fecha = this.fechaSistema();

    makeDraggable(this.$refs.draggableCard, ".card-header");
    makeDraggable(this.$refs.draggableTable, ".drag-handle");
  },

  template: `
    <div class="card floating-card bg-info" ref="draggableCard" :style="{ display: mostrarFormulario ? 'block' : 'none' }">
      <div class="card-header text-white">Registro de Lecturas</div>
      <div class="card-body overflow-auto" style="max-height: 550px; background-color: #fff;">
        <h5 class="card-title">Formulario de Registro de Lecturas</h5>

        <form id="fmrRegistroLecturas" @submit.prevent="registrarLectura" @reset.prevent="cancelarFormulario">

          <div class="mb-3">
            <label class="form-label">Código del Cliente:</label>
            <input
              type="text"
              class="form-control"
              placeholder="Ej: ABC1234"
              v-model="form.codigoCliente"
              :readonly="editingId !== null"
              :class="{ 'bg-light': editingId !== null }"
            >
          </div>

          <div class="mb-3">
            <label class="form-label">Cliente:</label>
            <input
              type="text"
              class="form-control"
              placeholder="Nombre del cliente"
              v-model="form.cliente"
              readonly
            >
          </div>

          <div class="mb-3">
            <label class="form-label">Fecha:</label>
            <input
              type="date"
              class="form-control"
              v-model="form.fecha"
            >
          </div>

          <div class="mb-3">
            <label class="form-label">Lectura anterior:</label>
            <input
              type="text"
              class="form-control"
              placeholder="Ingresa la lectura anterior"
              v-model="form.lectura_anterior"
            >
          </div>

          <div class="mb-3">
            <label class="form-label">Lectura actual:</label>
            <input
              type="text"
              class="form-control"
              placeholder="Ingresa la lectura actual"
              v-model="form.lectura_actual"
            >
          </div>

          <div class="mb-3">
            <label class="form-label">Pago:</label>
            <input
              type="text"
              class="form-control"
              placeholder="Ingresa el pago"
              v-model="form.pago"
            >
          </div>

          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-primary">
              {{ editingId === null ? 'Registrar' : 'Actualizar' }}
            </button>
            <button type="reset" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="floating-table" ref="draggableTable">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="mb-0 drag-handle" id="tableHandle">Lista de Lecturas</h5>
        <div class="input-group w-50">
          <input type="text" class="form-control" placeholder="Buscar por código, cliente o fecha" v-model="buscar">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
        </div>
      </div>

      <div class="table-scroll-wrap" id="tableScrollWrap">
        <table id="tblLecturas" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Código Cliente</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Lectura Anterior</th>
              <th>Lectura Actual</th>
              <th>Pago</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in lecturasFiltradas" :key="l.idLectura" @click="seleccionarLectura(l)" style="cursor: pointer;">
              <td>{{ l.codigoCliente }}</td>
              <td>{{ l.cliente }}</td>
              <td>{{ l.fecha }}</td>
              <td>{{ l.lectura_anterior }}</td>
              <td>{{ l.lectura_actual }}</td>
              <td>{{ l.pago }}</td>
              <td>
                <button type="button" class="btn btn-danger btn-sm btn-del" @click="eliminarLectura(l.idLectura, $event)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-end">
        <button class="btn btn-success mt-3" @click="mostrarFormulario = true; form.fecha = fechaSistema()">
          Registrar Lectura
        </button>
      </div>
    </div>
  `
};
