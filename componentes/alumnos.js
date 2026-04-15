const alumnos = {
    props: ['forms'],
    data() {
        return {
            alumno: { 
                idAlumno: 0, 
                codigo: "", 
                nombre: "", 
                fechaNacimiento: "",
                direccion: "", 
                telefono: "",
                sexo: ""
            },
            accion: 'nuevo',
            idAlumno: 0,
            cargandoEdicion: false
        }
    },
    watch: {
        "alumno.codigo"(val) {
            if (this.accion === 'modificar') return;
            const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            const letras = v.replace(/[^A-Z]/g, "").slice(0, 4);
            const numeros = v.replace(/[^0-9]/g, "").slice(0, 6);
            const nuevo = letras + numeros;
            if (nuevo !== val) this.alumno.codigo = nuevo;
        },
        "alumno.telefono"(val) {
            const digits = (val ?? "").replace(/\D/g, "").slice(0, 8);
            const nuevo = digits.length <= 4 ? digits : digits.slice(0, 4) + "-" + digits.slice(4);
            if (nuevo !== val) this.alumno.telefono = nuevo;
        }
    },
    async mounted() {
    },
    methods: {
        cerrarFormularioAlumno() { this.forms.alumnos.mostrar = false; },
        buscarAlumno() { this.forms.busqueda_alumnos.mostrar = !this.forms.busqueda_alumnos.mostrar; this.$emit('buscar'); },
        modificarAlumno(alumno) {
            this.accion = 'modificar';
            this.idAlumno = alumno.idAlumno;
            this.cargandoEdicion = true;
            this.alumno.codigo = alumno.codigo;
            this.alumno.nombre = alumno.nombre;
            this.alumno.fechaNacimiento = alumno.fechaNacimiento;
            this.alumno.direccion = alumno.direccion;
            this.alumno.telefono = alumno.telefono;
            this.alumno.sexo = alumno.sexo;
            this.$nextTick(() => (this.cargandoEdicion = false));
        },
        async guardarAlumno() {
            if (!this.alumno.codigo || !this.alumno.nombre || !this.alumno.fechaNacimiento || !this.alumno.sexo || !this.alumno.telefono || !this.alumno.direccion) {
                alertify.error("Por favor, completa todos los campos.");
                return;
            }

            if (!/^[A-Z]{4}[0-9]{6}$/.test(this.alumno.codigo)) {
                alertify.error("Código inválido. Debe ser 4 letras y 6 números.");
                return;
            }

            if (!/^[0-9]{4}-[0-9]{4}$/.test(this.alumno.telefono)) {
                alertify.error("Teléfono inválido. Debe ser formato 1234-5678.");
                return;
            }

            let datos = {
                idAlumno: this.accion == 'modificar' ? this.idAlumno : this.getId(),
                codigo: this.alumno.codigo,
                nombre: this.alumno.nombre,
                fechaNacimiento: this.alumno.fechaNacimiento,
                direccion: this.alumno.direccion,
                telefono: this.alumno.telefono,
                sexo: this.alumno.sexo
            };

            const existente = await db.first(
                `SELECT idAlumno, nombre FROM alumnos WHERE codigo = ? AND idAlumno <> ?;`,
                [datos.codigo, this.accion == 'modificar' ? this.idAlumno : '']
            );
            if (existente) { alertify.error(`El codigo del alumno ya existe, ${existente.nombre}`); return; }

            // Calcular Hash
            let hashVal = "";
            if (typeof CryptoJS !== 'undefined') {
                const sha256 = CryptoJS.SHA256;
                hashVal = sha256(JSON.stringify(datos)).toString();
            } else {
                hashVal = btoa(JSON.stringify(datos)); // Fallback si no está CryptoJS
            }
            datos.hash = hashVal;

            await db.exec(
                `INSERT INTO alumnos (idAlumno, codigo, nombre, fechaNacimiento, direccion, telefono, sexo, hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(idAlumno) DO UPDATE SET
                    codigo = excluded.codigo,
                    nombre = excluded.nombre,
                    fechaNacimiento = excluded.fechaNacimiento,
                    direccion = excluded.direccion,
                    telefono = excluded.telefono,
                    sexo = excluded.sexo,
                    hash = excluded.hash;`,
                [datos.idAlumno, datos.codigo, datos.nombre, datos.fechaNacimiento, datos.direccion, datos.telefono, datos.sexo, datos.hash]
            );

            fetch(`private/modulos/alumnos/alumno.php?accion=${this.accion}&alumnos=${JSON.stringify(datos)}`)
                .then(response => response.json())
                .then(data => { if (data != true) alertify.error(`Error al sincronizar con el servidor: ${data.msg || data}`); })
                .catch(err => console.error("Error sync", err));

            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
            
            // Actualizar la tabla de búsqueda automáticamente
            if (this.$root && this.$root.buscar) {
                this.$root.buscar('busqueda_alumnos', 'obtenerAlumnos');
            } else if (this.$parent && this.$parent.$refs && this.$parent.$refs.busqueda_alumnos) {
                this.$parent.$refs.busqueda_alumnos.obtenerAlumnos();
            }
        },
        getId() {
            return Date.now().toString();
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idAlumno = 0;
            this.alumno.codigo = '';
            this.alumno.nombre = '';
            this.alumno.fechaNacimiento = '';
            this.alumno.direccion = '';
            this.alumno.telefono = '';
            this.alumno.sexo = '';
        },
    },
    template: `
        <div v-draggable>
            <form id="frmAlumnos" @submit.prevent="guardarAlumno" @reset.prevent="limpiarFormulario">
                <div class="card text-bg-dark" style="max-height: 550px; overflow-y: auto;">
                    <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">REGISTRO DE ALUMNOS</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioAlumno"></button></div></div></div>
                    <div class="card-body">
                        <div class="row p-1"><div class="col-4">NOMBRE:</div><div class="col-8"><input placeholder="nombre" required v-model="alumno.nombre" type="text" class="form-control"></div></div>
                        <div class="row p-1"><div class="col-4">CODIGO:</div><div class="col-8"><input placeholder="codigo" required v-model="alumno.codigo" type="text" class="form-control" :readonly="accion === 'modificar'" :class="{ 'bg-secondary': accion === 'modificar' }"></div></div>
                        <div class="row p-1"><div class="col-4">FECHA NACIMIENTO:</div><div class="col-8"><input required v-model="alumno.fechaNacimiento" type="date" class="form-control"></div></div>
                        <div class="row p-1"><div class="col-4">TELEFONO:</div><div class="col-6"><input placeholder="telefono" required v-model="alumno.telefono" type="text" class="form-control"></div></div>
                        <div class="row p-1"><div class="col-4">DIRECCION:</div><div class="col-8"><input placeholder="direccion" required v-model="alumno.direccion" type="text" class="form-control"></div></div>
                        <div class="row p-1"><div class="col-4">SEXO:</div><div class="col-8">
                            <div class="form-check form-check-inline"><input class="form-check-input" type="radio" value="Femenino" v-model="alumno.sexo"><label class="form-check-label">Femenino</label></div>
                            <div class="form-check form-check-inline"><input class="form-check-input" type="radio" value="Masculino" v-model="alumno.sexo"><label class="form-check-label">Masculino</label></div>
                        </div></div>
                    </div>
                    <div class="card-footer"><div class="row"><div class="col text-center"><button type="submit" id="btnGuardarAlumno" class="btn btn-primary">GUARDAR</button><button type="reset" id="btnCancelarAlumno" class="btn btn-warning">NUEVO</button><button type="button" @click="buscarAlumno" id="btnBuscarAlumno" class="btn btn-success">BUSCAR</button></div></div></div>
                </div>
            </form>
        </div>
    `
};
