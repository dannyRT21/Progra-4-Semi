import { ClientesView } from "./views/RegistroClientes.view.js";
import { LecturasView } from "./views/RegistroLecturas2.js";

const { createApp } = Vue;

createApp({

  data() {
    return {
      currentView: "clientes"
    };
  },

  components: {
    ClientesView,
    LecturasView
  },

  methods: {

    abrirVentana(view) {
      this.currentView = view;
    }

  },

  template: `

    <nav class="navbar navbar-expand-lg bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          ::.. BIBLIOTECA ALEJANDRIA ..::
        </a>

        <div class="collapse navbar-collapse">
          <div class="navbar-nav">
            <a class="nav-link" href="#" @click.prevent="abrirVentana('clientes')">Clientes</a>
            <a class="nav-link" href="#" @click.prevent="abrirVentana('lecturas')">Lecturas</a>
          </div>
        </div>
      </div>
    </nav>

    <div class="container-fluid mt-3">
      <ClientesView v-if="currentView === 'clientes'" />
      <LecturasView v-if="currentView === 'lecturas'" />
    </div>

  `

}).mount("#app");