import { RegistroView } from "./views/Registro.view.js";
import { DocentesView } from "./views/RegistroDocentes.view.js";
import { MateriasView } from "./views/RegistroMaterias.view.js";
import { RegistroMatriculasView } from "./views/RegistroMatriculas.view.js";
import { InscripcionesView } from "./views/Inscripciones.view.js";

import { LoginView } from "./views/Login.view.js";
import { userService } from "./services/user.service.js";

const { createApp } = Vue;

createApp({

  data() {
    return {
      usuario: null,
      autenticado: false,
      currentView: "registro"
    };
  },

  components: {
    RegistroView,
    DocentesView,
    MateriasView,
    RegistroMatriculasView,
    InscripcionesView,
    LoginView
  },

  async mounted() {
    const user = await userService.getUsuarioActual();
    if (user) {
      this.usuario = user;
      this.autenticado = true;
    }
  },

  methods: {

    abrirVentana(view) {
      this.currentView = view;
    },

    onLoginSuccess(user) {
      this.usuario = user;
      this.autenticado = true;
    },

    logout() {
      userService.logout();
      this.usuario = null;
      this.autenticado = false;
      this.currentView = "registro";
    }

  },

  template: `

    <!-- 🔐 SI NO ESTÁ AUTENTICADO -->
    <LoginView
      v-if="!autenticado"
      @login-success="onLoginSuccess"
    />

    <!-- 🎓 SISTEMA ACADÉMICO -->
    <div v-else>

      <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">
            ::.. SISTEMA ACADEMICO ..::
          </a>

          <div class="collapse navbar-collapse">
            <div class="navbar-nav">
              <a class="nav-link" href="#" @click.prevent="abrirVentana('docentes')">Docentes</a>
              <a class="nav-link" href="#" @click.prevent="abrirVentana('registro')">Alumnos</a>
              <a class="nav-link" href="#" @click.prevent="abrirVentana('materias')">Materias</a>
              <a class="nav-link" href="#" @click.prevent="abrirVentana('matriculas')">Matrículas</a>
              <a class="nav-link" href="#" @click.prevent="abrirVentana('inscripciones')">Inscripciones</a>
            </div>

            <div class="ms-auto">
              <span class="me-3">
                Bienvenidx {{ usuario.nombre }}
              </span>
              <button class="btn btn-outline-danger btn-sm" @click="logout">
                Cerrar sesión
              </button>
            </div>

          </div>
        </div>
      </nav>

      <div class="container-fluid mt-3">
        <RegistroView v-if="currentView === 'registro'" />
        <DocentesView v-if="currentView === 'docentes'" />
        <MateriasView v-if="currentView === 'materias'" />
        <RegistroMatriculasView v-if="currentView === 'matriculas'" />
        <InscripcionesView v-if="currentView === 'inscripciones'" />
      </div>

    </div>
  `

}).mount("#app");