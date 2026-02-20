import { RegistroView } from "./views/Registro.view.js";
import { DocentesView } from "./views/RegistroDocentes.view.js";
import { MateriasView } from "./views/RegistroMaterias.view.js";

const { createApp } = Vue;

createApp({
  data() {
    return {
      // listo para cuando tengas más vistas (alumnos, materias, docentes...)
      currentView: "registro"
      
    };
  },
  components: { RegistroView, DocentesView, MateriasView },
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
              <a class="nav-link" href="#" @click.prevent="abrirVentana('docentes')">Docentes</a>
              <a class="nav-link" href="#" @click.prevent="abrirVentana('registro')">Alumnos</a>
              <a class="nav-link" href="#" @click.prevent="abrirVentana('materias')">Materias</a>
            </div>
          </div>
        </div>
      </nav>

      <div class="container-fluid">
        <RegistroView v-if="currentView === 'registro'" />
        <DocentesView v-if="currentView === 'docentes'" />
        <MateriasView v-if="currentView === 'materias'" />

      </div>
    </div>
  `
}).mount("#app");
