const buscar_docentes = {
    props: ['forms'],
    data() { return { buscar: '', docentes: [] } },
    methods: {
        cerrarFormularioBusquedaDocentes() { this.forms.busqueda_docentes.mostrar = false; },
        modificarDocente(docente) { this.$emit('modificar', docente); },
        async obtenerDocentes() {
            const texto = (this.buscar || "").trim().toLowerCase();
            const palabras = texto.split(/\s+/).filter(Boolean);

            let dataDocentes = await db.select(
                `SELECT idDocente, codigo, nombre, dui, email, telefono, direccion, escalafon, hash
                 FROM docentes
                 ORDER BY codigo;`
            );

            if (palabras.length > 0) {
                this.docentes = dataDocentes.filter(d => {
                    if (!d?.codigo || !d?.nombre || !d?.dui) return false;
                    const contenido = `${d.codigo} ${d.nombre} ${d.dui}`.toLowerCase();
                    return palabras.every(p => contenido.includes(p));
                });
            } else {
                this.docentes = dataDocentes;
            }

            if (this.docentes.length < 1 && this.buscar.length <= 0) {
                fetch(`private/modulos/docentes/docente.php?accion=consultar`)
                    .then(response => response.json())
                    .then(async data => {
                        this.docentes = data;
                        for (const docente of data) {
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
                                [docente.idDocente, docente.codigo, docente.nombre, docente.dui, docente.email, docente.telefono, docente.direccion, docente.escalafon, docente.hash ?? null]
                            );
                        }
                    });
            }
        },
        async eliminarDocente(docente, e) {
            e.stopPropagation();

            alertify.confirm('Eliminar docente', `¿Estás seguro de que deseas eliminar este docente: ${docente.nombre}?`, async () => {
                await db.exec(`DELETE FROM docentes WHERE idDocente = ?;`, [docente.idDocente]);
                fetch(`private/modulos/docentes/docente.php?accion=eliminar&docentes=${JSON.stringify(docente)}`)
                    .then(response => response.json())
                    .then(data => { if (data != true) alertify.error(`Error al sincronizar con el servidor: ${data}`); });
                await this.obtenerDocentes();
                alertify.error(`Docente eliminado`);
            }, () => { });
        },
    },
    template: `
        <div v-draggable>
            <div class="card floating-table border-0 shadow-lg mb-3">
                <div class="card-header bg-dark text-white d-flex align-items-center justify-content-between">
                    <h5 class="mb-0 drag-handle" id="tableHandle">Lista de Docentes</h5>
                    <div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioBusquedaDocentes"></button></div>
                </div>
                <div class="card-body p-0">
                    <div class="p-3 bg-light border-bottom">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Buscar por nombre, código o DUI" @input="obtenerDocentes()" v-model="buscar">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                        </div>
                    </div>
                    <div class="table-scroll-wrap" id="tableScrollWrap">
                        <table id="tblDocentes" class="table table-striped table-hover m-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>DUI</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Escalafón</th>
                                    <th>Dirección</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="d in docentes" :key="d.idDocente" @click="modificarDocente(d)" style="cursor: pointer;">
                                    <td>{{ d.codigo }}</td>
                                    <td>{{ d.nombre }}</td>
                                    <td>{{ d.dui }}</td>
                                    <td>{{ d.telefono }}</td>
                                    <td>{{ d.email }}</td>
                                    <td>Grado {{ d.escalafon }}</td>
                                    <td>{{ d.direccion }}</td>
                                    <td>
                                        <button type="button" class="btn btn-danger btn-sm btn-del" @click="eliminarDocente(d, $event)">Eliminar</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
};
