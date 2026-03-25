const materias = {
    props:['forms'],
    data(){ return{ materia:{ idMateria:0, codigo:"", nombre:"", uv:'' }, accion:'nuevo', idMateria:0 } },
    methods:{
        cerrarFormularioMateria(){ this.forms.materias.mostrar = false; },
        buscarMateria(){ this.forms.busqueda_materias.mostrar = !this.forms.busqueda_materias.mostrar; this.$emit('buscar'); },
        modificarMateria(materia){ this.accion = 'modificar'; this.idMateria = materia.idMateria; this.materia.codigo = materia.codigo; this.materia.nombre = materia.nombre; this.materia.uv = materia.uv; },
        async guardarMateria() {
            let datos = { idMateria: this.accion=='modificar' ? this.idMateria : this.getId(), codigo: this.materia.codigo, nombre: this.materia.nombre, uv: this.materia.uv };
            const existente = await db.first(`SELECT idMateria, nombre FROM materias WHERE codigo = ? AND idMateria <> ?;`, [datos.codigo, this.accion=='modificar' ? this.idMateria : '']);
            if(existente){ alertify.error(`El codigo del materia ya existe, ${existente.nombre}`); return; }
            await db.exec(
                `INSERT INTO materias (idMateria, codigo, nombre, uv)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(idMateria) DO UPDATE SET codigo = excluded.codigo, nombre = excluded.nombre, uv = excluded.uv;`,
                [datos.idMateria, datos.codigo, datos.nombre, datos.uv]
            );
            fetch(`private/modulos/materias/materia.php?accion=${this.accion}&materias=${JSON.stringify(datos)}`)
                .then(response=>response.json())
                .then(data=>{ if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`); });
            this.limpiarFormulario();
            alertify.success(`Materia ${datos.nombre} guardada correctamente`);
        },
        getId(){ return uuid.v4(); },
        limpiarFormulario(){ this.accion = 'nuevo'; this.idMateria = 0; this.materia.codigo = ''; this.materia.nombre = ''; this.materia.uv = ''; },
    },
    template: `
    <div v-draggable>
        <form id="frmMaterias" @submit.prevent="guardarMateria" @reset.prevent="limpiarFormulario">
            <div class="card text-bg-dark">
                <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">REGISTRO DE MATERIAS</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioMateria"></button></div></div></div>
                <div class="card-body">
                    <div class="row p-1"><div class="col-3">CODIGO:</div><div class="col-3"><input placeholder="codigo" required v-model="materia.codigo" type="text" class="form-control"></div></div>
                    <div class="row p-1"><div class="col-3">NOMBRE:</div><div class="col-6"><input placeholder="nombre" required v-model="materia.nombre" type="text" class="form-control"></div></div>
                    <div class="row p-1"><div class="col-3">UV:</div><div class="col-9"><input placeholder="uv" required v-model="materia.uv" type="text" class="form-control"></div></div>
                </div>
                <div class="card-footer"><div class="row"><div class="col text-center"><button type="submit" id="btnGuardarMateria" class="btn btn-primary">GUARDAR</button><button type="reset" id="btnCancelarMateria" class="btn btn-warning">NUEVO</button><button type="button" @click="buscarMateria" id="btnBuscarMateria" class="btn btn-success">BUSCAR</button></div></div></div>
            </div>
        </form>
    </div>
    `
};
