const buscar_materias = {
    props:['forms'],
    data(){ return{ buscar:'', materias:[] } },
    methods:{
        cerrarFormularioBusquedaMateria(){ this.forms.busqueda_materias.mostrar = false; },
        modificarMateria(materia){ this.$emit('modificar', materia); },
        async obtenerMaterias(){
            const criterio = `%${this.buscar.toLowerCase()}%`;
            this.materias = await db.select(
                `SELECT idMateria, codigo, nombre, uv
                 FROM materias
                 WHERE lower(codigo) LIKE ? OR lower(nombre) LIKE ?
                 ORDER BY codigo;`,
                [criterio, criterio]
            );
            if( this.materias.length<1 && this.buscar.length<=0){
                fetch(`private/modulos/materias/materia.php?accion=consultar`)
                    .then(response=>response.json())
                    .then(async data=>{
                        this.materias = data;
                        for (const materia of data) {
                            await db.exec(
                                `INSERT INTO materias (idMateria, codigo, nombre, uv)
                                 VALUES (?, ?, ?, ?)
                                 ON CONFLICT(idMateria) DO UPDATE SET codigo = excluded.codigo, nombre = excluded.nombre, uv = excluded.uv;`,
                                [materia.idMateria, materia.codigo, materia.nombre, materia.uv]
                            );
                        }
                    });
            }
        },
        async eliminarMateria(materia, e){
            e.stopPropagation();
            alertify.confirm('Eliminar materias', `¿Está seguro de eliminar el materia ${materia.nombre}?`, async e=>{
                await db.exec(`DELETE FROM materias WHERE idMateria = ?;`, [materia.idMateria]);
                fetch(`private/modulos/materias/materia.php?accion=eliminar&materias=${JSON.stringify(materia)}`)
                    .then(response=>response.json())
                    .then(data=>{ if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`); });
                await this.obtenerMaterias();
                alertify.success(`Materia ${materia.nombre} eliminada correctamente`);
            }, () => {});
        },
    },
    template: `
        <div v-draggable>
            <div class="card text-bg-dark">
                <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">BUSQUEDA DE MATERIAS</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioBusquedaMateria"></button></div></div></div>
                <div class="card-body">
                    <table class="table table-striped table-hover" id="tblMaterias">
                        <thead>
                            <tr><th colspan="6"><input autocomplete="off" type="search" @keyup="obtenerMaterias()" v-model="buscar" placeholder="Buscar materia" class="form-control"></th></tr>
                            <tr><th>CODIGO</th><th>NOMBRE</th><th>UV</th><th></th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="materia in materias" :key="materia.idMateria" @click="modificarMateria(materia)">
                                <td>{{ materia.codigo }}</td><td>{{ materia.nombre }}</td><td>{{ materia.uv }}</td>
                                <td><button class="btn btn-danger" @click="eliminarMateria(materia, $event)">DEL</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
