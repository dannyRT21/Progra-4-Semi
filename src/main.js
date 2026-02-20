import { RegistroView } from "./views/Registro.view.js";

const { createApp } = Vue;

createApp({
  data() {
    return {
      // listo para cuando tengas más vistas (alumnos, materias, docentes...)
      currentView: "registro"
    };
  },
  components: { RegistroView },
  methods: {
    abrirVentana(view) {
      this.currentView = view;
    }
  },
  template: `
    <div>
      <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">::.. SISTEMA ACADEMICO ..::</a>
          <div class="collapse navbar-collapse">
            <div class="navbar-nav">
              <a class="nav-link" href="#" @click.prevent="abrirVentana('registro')">Alumnos</a>
              <a class="nav-link disabled" href="#" aria-disabled="true">Materias</a>
              <a class="nav-link disabled" href="#" aria-disabled="true">Docentes</a>
            </div>
          </div>
        </div>
      </nav>

      <div class="container-fluid">
        <RegistroView v-if="currentView === 'registro'" />
      </div>
    </div>
  `
}).mount("#app");
