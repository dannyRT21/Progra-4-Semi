// views/Login.view.js
import { userService } from "../services/user.service.js";

export const LoginView = {

  template: `
  <div class="main-container">

    <div class="login-container">
      <h2>Sistema Académico</h2>

      <p class="error">{{ error }}</p>

      <form @submit.prevent="submitForm">

        <div v-if="modoRegistro" class="form-group">
          <label>Nombre completo</label>
          <input v-model="form.nombre" type="text" required />
        </div>

        <div class="form-group">
          <label>Correo electrónico</label>
          <input v-model="form.usuario" type="email" required />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.clave" type="password" required />
        </div>

        <div v-if="modoRegistro" class="form-group">
          <label>Confirmar contraseña</label>
          <input v-model="confirmarClave" type="password" required />
        </div>

        <button type="submit" class="btn-login">
          {{ modoRegistro ? 'Crear cuenta' : 'Iniciar sesión' }}
        </button>

        <button type="button"
                class="btn-login"
                style="margin-top:10px; background:#555;"
                @click="toggleModo">
          {{ modoRegistro ? 'Volver al login' : 'Registrarse' }}
        </button>

      </form>
    </div>

    <div class="flip-card">
      <div class="content">
        <div class="front">
          <div>
            <div class="flip-card-title">Sistema Académico</div>
            <div class="flip-card-text">
              Esta es una aplicación web para administrar datos de una Universidad de Tecnologia.
            </div>
          </div>
        </div>
        <div class="back">
          <div>
            <div class="flip-card-title">Servicios Ofertados</div>
            <div class="flip-card-text">
             Ofrece servicios de gestión de alumnos, docentes, materias... Administración de matriculas e inscripciones.
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `,

  data() {
    return {
      modoRegistro: false,
      confirmarClave: "",
      error: "",
      form: {
        usuario: "",
        clave: "",
        nombre: ""
      }
    }
  },

  methods: {

    toggleModo() {
      this.modoRegistro = !this.modoRegistro;
      this.error = "";
      this.form = { usuario: "", clave: "", nombre: "" };
      this.confirmarClave = "";
    },

    async submitForm() {

      this.error = "";

      if (this.modoRegistro) {

        if (this.form.clave !== this.confirmarClave) {
          this.error = "Las contraseñas no coinciden.";
          return;
        }

        const res = await userService.registrarUsuario(this.form);

        if (!res.ok) {
          this.error = res.error;
          return;
        }

        alert("Usuario creado correctamente. Ahora puedes iniciar sesión.");
        this.toggleModo();

      } else {

        const res = await userService.login(this.form.usuario, this.form.clave);

        if (!res.ok) {
          this.error = res.error;
          return;
        }

       this.$emit("login-success", res.user);
      }
    }
  }
};