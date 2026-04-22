/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

import './bootstrap';
import { createApp } from 'vue';

/**
 * Next, we will create a fresh Vue application instance. You may then begin
 * registering components with the application instance so they are ready
 * to use in your application's views. An example is included for you.
 */

import AlumnoComponent from './components/AlumnoComponent.vue';
import BusquedaAlumnoComponent from './components/BusquedaAlumnoComponent.vue';

const app = createApp({
    data() {
        return {
            forms: {
                alumnos: { mostrar: false },
                buscar_alumnos: { mostrar: false },
                materias: { mostrar: false },
                docentes: { mostrar: false },
                matriculas: { mostrar: false },
                inscripciones: { mostrar: false },
            }
        };
    },
    methods: {
        abrirVentana(ventana) {
            this.forms[ventana].mostrar = !this.forms[ventana].mostrar;
        },
        buscar(ventana, metodo) {
            this.forms[ventana].mostrar = !this.forms[ventana].mostrar;
            if(this.$refs[ventana] && typeof this.$refs[ventana][metodo] === 'function'){
                this.$refs[ventana][metodo]();
            }
        },
        modificar(ventana, metodo, datos) {
            this.forms[ventana].mostrar = true;
            if(this.$refs[ventana] && typeof this.$refs[ventana][metodo] === 'function'){
                this.$refs[ventana][metodo](datos);
            }
        },
        hacerBackup() {
            console.log('Backup no implementado aún');
        }
    }
});

app.component('alumnos', AlumnoComponent);
app.component('buscar_alumnos', BusquedaAlumnoComponent);

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// Object.entries(import.meta.glob('./**/*.vue', { eager: true })).forEach(([path, definition]) => {
//     app.component(path.split('/').pop().replace(/\.\w+$/, ''), definition.default);
// });

/**
 * Finally, we will attach the application instance to a HTML element with
 * an "id" attribute of "app". This element is included with the "auth"
 * scaffolding. Otherwise, you will need to add an element yourself.
 */
app.mount('#appSistema');
