const buscar_alumnos = {
    props: ['forms'],
    data() { return { buscar: '', alumnos: [] } },
    methods: {
        cerrarFormularioBusquedaAlumnos() { this.forms.busqueda_alumnos.mostrar = false; },
        modificarAlumno(alumno) { this.$emit('modificar', alumno); },
        async obtenerAlumnos() {
            // Separa por palabras
            const texto = (this.buscar || "").trim().toLowerCase();
            const palabras = texto.split(/\s+/).filter(Boolean);
            
            // Busca base
            let dataAlumnos = await db.select(
                `SELECT idAlumno, codigo, nombre, fechaNacimiento, direccion, telefono, sexo, hash
                 FROM alumnos
                 ORDER BY codigo;`
            );
            
            // Filtrado múltiple equivalente al Registro.view.js
            if (palabras.length > 0) {
                this.alumnos = dataAlumnos.filter(a => {
                    if (!a?.codigo || !a?.nombre) return false;
                    const contenido = `${a.codigo} ${a.nombre}`.toLowerCase();
                    return palabras.every(p => contenido.includes(p));
                });
            } else {
                this.alumnos = dataAlumnos;
            }

            if (this.alumnos.length < 1 && this.buscar.length <= 0) {
                fetch(`private/modulos/alumnos/alumno.php?accion=consultar`)
                    .then(response => response.json())
                    .then(async data => {
                        this.alumnos = data;
                        for (const alumno of data) {
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
                                [alumno.idAlumno, alumno.codigo, alumno.nombre, alumno.fechaNacimiento, alumno.direccion, alumno.telefono, alumno.sexo, alumno.hash ?? null]
                            );
                        }
                    });
            }
        },
        async eliminarAlumno(alumno, e) {
            e.stopPropagation();

            // Validar matricula activa
            // Para la arquitectura del inge puede que la tabla de matriculas tenga la clave foránea a `alumnos` (generalmente idAlumno)
            let matriculasActivas = [];
            try {
                // Esto asume que hay tabla matriculas o matricula. Adaptamos según Registro.view.js (que usaba 'id') 
                // pero ahora usamos idAlumno según la estructura relacional.
                matriculasActivas = await db.select(`SELECT count(*) as count FROM matriculas WHERE idAlumno = ? AND estado = 'Activo'`, [alumno.idAlumno]);
            } catch (err) {
                try { // Tratar si se llama matricula 
                    matriculasActivas = await db.select(`SELECT count(*) as count FROM matricula WHERE idAlumno = ? AND estado = 'Activo'`, [alumno.idAlumno]);
                } catch(e2){}
            }

            if (matriculasActivas.length > 0 && matriculasActivas[0].count > 0) {
                alertify.error("No se puede eliminar el alumno porque tiene una matrícula en estado Activo.");
                return;
            }

            alertify.confirm('Eliminar alumno', `¿Está seguro de eliminar el alumno ${alumno.nombre}?`, async e => {
                await db.exec(`DELETE FROM alumnos WHERE idAlumno = ?;`, [alumno.idAlumno]);
                fetch(`private/modulos/alumnos/alumno.php?accion=eliminar&alumnos=${JSON.stringify(alumno)}`)
                    .then(response => response.json())
                    .then(data => { if (data != true) alertify.error(`Error al sincronizar con el servidor: ${data}`); });
                await this.obtenerAlumnos();
                alertify.success(`Alumno ${alumno.nombre} eliminado correctamente`);
            }, () => { });
        },
    },
    template: `
        <div v-draggable>
            <div class="card text-bg-dark mb-3">
                <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">BUSQUEDA DE ALUMNOS</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioBusquedaAlumnos"></button></div></div></div>
                <div class="card-body">
                    <table class="table table-striped table-hover" id="tblAlumnos">
                        <thead>
                            <tr><th colspan="7"><input autocomplete="off" type="search" @input="obtenerAlumnos()" v-model="buscar" placeholder="Buscar por código y nombre" class="form-control"></th></tr>
                            <tr><th>NOMBRE</th><th>CÓDIGO</th><th>FECHA</th><th>SEXO</th><th>TELÉFONO</th><th>DIRECCIÓN</th><th></th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="alumno in alumnos" :key="alumno.idAlumno" @click="modificarAlumno(alumno)">
                                <td>{{ alumno.nombre }}</td><td>{{ alumno.codigo }}</td><td>{{ alumno.fechaNacimiento }}</td><td>{{ alumno.sexo }}</td><td>{{ alumno.telefono }}</td><td>{{ alumno.direccion }}</td>
                                <td><button class="btn btn-danger" @click="eliminarAlumno(alumno, $event)">DEL</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
