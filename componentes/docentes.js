const docentes = {
    props: ['forms'],
    data() {
        return {
            docente: {
                idDocente: 0,
                codigo: "",
                nombre: "",
                dui: "",
                email: "",
                telefono: "",
                direccion: "",
                escalafon: ""
            },
            accion: 'nuevo',
            idDocente: 0,
            cargandoEdicion: false
        }
    },
    watch: {
        "docente.codigo"(val) {
            if (this.accion === 'modificar') return;
            const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            const letras = v.replace(/[^A-Z]/g, "").slice(0, 4);
            const numeros = v.replace(/[^0-9]/g, "").slice(0, 6);
            const nuevo = letras + numeros;
            if (nuevo !== val) this.docente.codigo = nuevo;
        },
        "docente.telefono"(val) {
            const digits = (val ?? "").replace(/\D/g, "").slice(0, 8);
            const nuevo = digits.length <= 4 ? digits : digits.slice(0, 4) + "-" + digits.slice(4);
            if (nuevo !== val) this.docente.telefono = nuevo;
        },
        "docente.dui"(val) {
            const digits = (val ?? "").replace(/\D/g, "").slice(0, 9);
            const nuevo = digits.length <= 8 ? digits : digits.slice(0, 8) + "-" + digits.slice(8);
            if (nuevo !== val) this.docente.dui = nuevo;
        }
    },
    methods: {
        cerrarFormularioDocente() { this.forms.docentes.mostrar = false; },
        buscarDocente() { this.forms.busqueda_docentes.mostrar = !this.forms.busqueda_docentes.mostrar; this.$emit('buscar'); },
        modificarDocente(docente) {
            this.accion = 'modificar';
            this.idDocente = docente.idDocente;
            this.cargandoEdicion = true;
            this.docente.codigo = docente.codigo;
            this.docente.nombre = docente.nombre;
            this.docente.dui = docente.dui;
            this.docente.email = docente.email;
            this.docente.telefono = docente.telefono;
            this.docente.direccion = docente.direccion;
            this.docente.escalafon = docente.escalafon;
            this.$nextTick(() => (this.cargandoEdicion = false));
        },
        async guardarDocente() {
            if (!this.docente.codigo || !this.docente.nombre || !this.docente.dui || !this.docente.email || !this.docente.telefono || !this.docente.direccion || !this.docente.escalafon) {
                alertify.error("Por favor, completa todos los campos.");
                return;
            }

            if (!/^[A-Z]{4}[0-9]{6}$/.test(this.docente.codigo)) {
                alertify.error("Código inválido. Debe ser 4 letras y 6 números.");
                return;
            }

            if (!/^[0-9]{8}-[0-9]$/.test(this.docente.dui)) {
                alertify.error("DUI inválido. Debe tener el formato 12345678-9.");
                return;
            }

            if (!/^[0-9]{4}-[0-9]{4}$/.test(this.docente.telefono)) {
                alertify.error("Teléfono inválido. Debe tener el formato 1234-5678.");
                return;
            }

            let datos = {
                idDocente: this.accion == 'modificar' ? this.idDocente : this.getId(),
                codigo: this.docente.codigo,
                nombre: this.docente.nombre,
                dui: this.docente.dui,
                email: this.docente.email,
                telefono: this.docente.telefono,
                direccion: this.docente.direccion,
                escalafon: this.docente.escalafon
            };

            const existente = await db.first(
                `SELECT idDocente, nombre FROM docentes WHERE codigo = ? AND idDocente <> ?;`,
                [datos.codigo, this.accion == 'modificar' ? this.idDocente : '']
            );
            if (existente) { alertify.error(`El código ya existe y pertenece a: ${existente.nombre}`); return; }

            // Calcular Hash
            let hashVal = "";
            if (typeof CryptoJS !== 'undefined') {
                const sha256 = CryptoJS.SHA256;
                hashVal = sha256(JSON.stringify(datos)).toString();
            } else {
                hashVal = btoa(JSON.stringify(datos));
            }
            datos.hash = hashVal;

            await db.exec(
                `INSERT INTO docentes (idDocente, codigo, nombre, dui, email, telefono, direccion, escalafon, hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(idDocente) DO UPDATE SET
                    codigo = excluded.codigo,
                    nombre = excluded.nombre,
                    dui = excluded.dui,
                    email = excluded.email,
                    telefono = excluded.telefono,
                    direccion = excluded.direccion,
                    escalafon = excluded.escalafon,
                    hash = excluded.hash;`,
                [datos.idDocente, datos.codigo, datos.nombre, datos.dui, datos.email, datos.telefono, datos.direccion, datos.escalafon, datos.hash]
            );

            fetch(`private/modulos/docentes/docente.php?accion=${this.accion}&docentes=${JSON.stringify(datos)}`)
                .then(response => response.json())
                .then(data => { if (data != true) alertify.error(`Error al sincronizar con el servidor: ${data.msg || data}`); })
                .catch(err => console.error("Error sync", err));

            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
            
            // Refrescar tabla si la instancia root está disponible
            if (this.$root && this.$root.buscar) {
                this.$root.buscar('busqueda_docentes', 'obtenerDocentes');
            } else if (this.$parent && this.$parent.$refs && this.$parent.$refs.busqueda_docentes) {
                this.$parent.$refs.busqueda_docentes.obtenerDocentes();
            }
        },
        getId() {
            return Date.now().toString();
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idDocente = 0;
            this.docente.codigo = '';
            this.docente.nombre = '';
            this.docente.dui = '';
            this.docente.email = '';
            this.docente.telefono = '';
            this.docente.direccion = '';
            this.docente.escalafon = '';
        },
    },
    template: `
        <div v-draggable>
            <form id="frmDocentes" @submit.prevent="guardarDocente" @reset.prevent="limpiarFormulario">
                <div class="card bg-info floating-card text-white" style="max-height: 550px; overflow-y: auto; max-width: 500px;">
                    <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">REGISTRO DE DOCENTES</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioDocente"></button></div></div></div>
                    <div class="card-body" style="background-color: #fff; color: #000;">
                        <h5 class="card-title text-dark">Formulario de Registro de Docentes</h5>
                        <div class="mb-3">
                            <label class="form-label">Nombre:</label>
                            <input type="text" class="form-control" placeholder="Ingresa el nombre" v-model="docente.nombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Código:</label>
                            <input type="text" class="form-control" placeholder="Ej: ABCD123456" v-model="docente.codigo" :readonly="accion === 'modificar'" :class="{ 'bg-light': accion === 'modificar' }" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">DUI:</label>
                            <input type="text" class="form-control" placeholder="ejemplo: 12345678-9" v-model="docente.dui" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email:</label>
                            <input type="email" class="form-control" placeholder="correo@ejemplo.com" v-model="docente.email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Teléfono:</label>
                            <input type="text" class="form-control" placeholder="ejemplo: 1234-5678" v-model="docente.telefono" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Dirección:</label>
                            <input type="text" class="form-control" placeholder="Ingresa la dirección" v-model="docente.direccion" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Escalafón:</label>
                            <select class="form-select" v-model="docente.escalafon" required>
                                <option value="">Selecciona el grado</option>
                                <option value="1">Grado 1</option>
                                <option value="2">Grado 2</option>
                                <option value="3">Grado 3</option>
                                <option value="4">Grado 4</option>
                                <option value="5">Grado 5</option>
                                <option value="6">Grado 6</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-footer bg-light"><div class="d-flex justify-content-between"><button type="submit" id="btnGuardarDocente" class="btn btn-primary">Registrar</button><button type="reset" id="btnCancelarDocente" class="btn btn-secondary">Cancelar</button><button type="button" @click="buscarDocente" id="btnBuscarDocente" class="btn btn-success">BUSCAR</button></div></div>
                </div>
            </form>
        </div>
    `
};
