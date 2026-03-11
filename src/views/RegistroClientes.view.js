import { makeDraggable } from "../utils/draggable.js";
import { db, initDb } from "../db/db.js";

export const ClientesView = {
  data() {
    return {
      cargandoEdicion: false,
      mostrarFormulario: false,
      editingId: null,
      buscar: "",
      clientes: [],
      form: {
        codigo: "",
        nombre: "",
        direccion: "",
        zona: ""
      }
    };
  },

  computed: {
    clientesFiltrados() {
      const texto = (this.buscar || "").trim().toUpperCase();
      if (!texto) return this.clientes;
      const palabras = texto.split(/\s+/).filter(Boolean);

      return this.clientes.filter((c) => {
        if (!c?.codigo || !c?.nombre || !c?.direccion || !c?.zona) return false;
        const contenido = `${c.codigo} ${c.nombre} ${c.direccion} ${c.zona}`.toUpperCase();
        return palabras.every(p => contenido.includes(p));
      });
    }
  },

  watch: {
    "form.codigo"(val) {
      if (this.editingId !== null) return;
      const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const letras = v.replace(/[^A-Z]/g, "").slice(0, 3);
      const numeros = v.replace(/[^0-9]/g, "").slice(0, 4);
      const nuevo = letras + numeros;
      if (nuevo !== val) this.form.codigo = nuevo;
    }
  },

  methods: {
    async cargarClientes() {
      this.clientes = await db.clientes.toArray();
    },

    seleccionarCliente(c) {
      this.editingId = c.idCliente;
      this.cargandoEdicion = true;

      this.form = {
        codigo: c.codigo ?? "",
        nombre: c.nombre ?? "",
        direccion: c.direccion ?? "",
        zona: c.zona ?? ""
      };

      this.mostrarFormulario = true;
      this.$nextTick(() => (this.cargandoEdicion = false));
    },

    async eliminarCliente(id, e) {
      if (e) e.stopPropagation();
      if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;

      await db.clientes.delete(id);
      await this.cargarClientes();

      if (this.editingId === id) this.cancelarFormulario();
      if (window.alertify) alertify.error("Cliente eliminado");
    },

    async buscarClientePorCodigo(codigo, ignoreId = null) {
      const code = (codigo ?? "").trim().toUpperCase();
      const found = await db.clientes.where("codigo").equals(code).first();
      if (!found) return null;
      if (ignoreId && found.idCliente === ignoreId) return null;
      return found;
    },

    async registrarCliente() {
      const esNuevo = this.editingId === null;

      const codigo = (this.form.codigo || "").trim().toUpperCase();
      const nombre = (this.form.nombre || "").trim();
      const direccion = (this.form.direccion || "").trim();
      const zona = (this.form.zona || "").trim();

      if (!codigo || !nombre || !direccion || !zona) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (!/^[A-Z]{3}[0-9]{4}$/.test(codigo)) {
        alert("Código inválido. Debe ser 3 letras y 4 números (ej: ABC1234).");
        return;
      }

      if (esNuevo) {
        const existente = await this.buscarClientePorCodigo(codigo, null);
        if (existente) {
          alert(`El código ya existe y pertenece a: ${existente.nombre}`);
          return;
        }
      } else {
        const choque = await this.buscarClientePorCodigo(codigo, this.editingId);
        if (choque) {
          alert(`El código ya existe y pertenece a: ${choque.nombre}`);
          return;
        }
      }

      const cliente = {
        codigo,
        nombre,
        direccion,
        zona
      };

      if (!esNuevo) {
        cliente.idCliente = this.editingId;
      }

      await db.clientes.put(cliente);

      await this.cargarClientes();
      this.cancelarFormulario();

      if (window.alertify) {
        alertify.success(esNuevo ? "Cliente registrado" : "Cliente actualizado");
      }
    },

    cancelarFormulario() {
      this.editingId = null;
      this.form = {
        codigo: "",
        nombre: "",
        direccion: "",
        zona: ""
      };
      this.mostrarFormulario = false;
    }
  },

  async mounted() {
    await initDb();
    await this.cargarClientes();

    makeDraggable(this.$refs.draggableCard, ".card-header");
    makeDraggable(this.$refs.draggableTable, ".drag-handle");
  },

  template: `
    <div class="card floating-card bg-info" ref="draggableCard" :style="{ display: mostrarFormulario ? 'block' : 'none' }">
      <div class="card-header text-white">Registro de Clientes</div>
      <div class="card-body overflow-auto" style="max-height: 550px; background-color: #fff;">
        <h5 class="card-title">Formulario de Registro de Clientes</h5>

        <form id="fmrRegistroClientes" @submit.prevent="registrarCliente" @reset.prevent="cancelarFormulario">

          <div class="mb-3">
            <label class="form-label">Nombre:</label>
            <input type="text" class="form-control" placeholder="Ingresa el nombre" v-model="form.nombre">
          </div>

          <div class="mb-3">
            <label class="form-label">Código:</label>
            <input type="text" class="form-control" placeholder="Ej: ABC1234" v-model="form.codigo" :readonly="editingId !== null" :class="{ 'bg-light': editingId !== null }">
          </div>

          <div class="mb-3">
            <label class="form-label">Dirección:</label>
            <input type="text" class="form-control" placeholder="Ingresa la dirección" v-model="form.direccion">
          </div>

          <div class="mb-3">
            <label class="form-label">Zona:</label>
            <input type="text" class="form-control" placeholder="Ingresa la zona" v-model="form.zona">
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
        <h5 class="mb-0 drag-handle" id="tableHandle">Lista de Clientes</h5>
        <div class="input-group w-50">
          <input type="text" class="form-control" placeholder="Buscar por código, nombre, dirección o zona" v-model="buscar">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
        </div>
      </div>

      <div class="table-scroll-wrap" id="tableScrollWrap">
        <table id="tblClientes" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Zona</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in clientesFiltrados" :key="c.idCliente" @click="seleccionarCliente(c)" style="cursor: pointer;">
              <td>{{ c.codigo }}</td>
              <td>{{ c.nombre }}</td>
              <td>{{ c.direccion }}</td>
              <td>{{ c.zona }}</td>
              <td>
                <button type="button" class="btn btn-danger btn-sm btn-del" @click="eliminarCliente(c.idCliente, $event)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-end">
        <button class="btn btn-success mt-3" @click="mostrarFormulario = true">
          Registrar Cliente
        </button>
      </div>
    </div>
  `
};
