const docentes = {
    props:['forms'],
    data(){ return{ docente:{ idDocente:0, codigo:"", nombre:"", direccion:"", email:"", telefono:"", escalafon:"" }, accion:'nuevo', idDocente:0 } },
    methods:{
        buscarDocente(){ this.forms.busqueda_docentes.mostrar = !this.forms.busqueda_docentes.mostrar; this.$emit('buscar'); },
        modificarDocente(docente){ this.accion = 'modificar'; this.idDocente = docente.idDocente; this.docente.codigo = docente.codigo; this.docente.nombre = docente.nombre; this.docente.direccion = docente.direccion; this.docente.email = docente.email; this.docente.telefono = docente.telefono; this.docente.escalafon = docente.escalafon; },
        async guardarDocente() {
            let datos = { idDocente: this.accion=='modificar' ? this.idDocente : this.getId(), codigo: this.docente.codigo, nombre: this.docente.nombre, direccion: this.docente.direccion, email: this.docente.email, telefono: this.docente.telefono, escalafon: this.docente.escalafon };
            const existente = await db.first(`SELECT idDocente, nombre FROM docentes WHERE codigo = ? AND idDocente <> ?;`, [datos.codigo, this.accion=='modificar' ? this.idDocente : '']);
            if(existente){ alertify.error(`El codigo del docente ya existe, ${existente.nombre}`); return; }
            await db.exec(
                `INSERT INTO docentes (idDocente, codigo, nombre, direccion, email, telefono, escalafon)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(idDocente) DO UPDATE SET codigo = excluded.codigo, nombre = excluded.nombre, direccion = excluded.direccion, email = excluded.email, telefono = excluded.telefono, escalafon = excluded.escalafon;`,
                [datos.idDocente, datos.codigo, datos.nombre, datos.direccion, datos.email, datos.telefono, datos.escalafon]
            );
            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
        },
        getId(){ return `${Date.now()}`; },
        limpiarFormulario(){ this.accion = 'nuevo'; this.idDocente = 0; this.docente.codigo = ''; this.docente.nombre = ''; this.docente.direccion = ''; this.docente.email = ''; this.docente.telefono = ''; this.docente.escalafon = ''; },
    },
    template: `
        <div class="row">
            <div class="col-6">
                <form id="frmDocentes" @submit.prevent="guardarDocente" @reset.prevent="limpiarFormulario">
                    <div class="card text-bg-dark mb-3" style="max-width: 36rem;">
                        <div class="card-header">REGISTRO DE DOCENTES</div>
                        <div class="card-body">
                            <div class="row p-1"><div class="col-3">CODIGO:</div><div class="col-3"><input placeholder="codigo" required v-model="docente.codigo" type="text" class="form-control"></div></div>
                            <div class="row p-1"><div class="col-3">NOMBRE:</div><div class="col-6"><input placeholder="nombre" required v-model="docente.nombre" type="text" class="form-control"></div></div>
                            <div class="row p-1"><div class="col-3">DIRECCION:</div><div class="col-9"><input placeholder="direccion" required v-model="docente.direccion" type="text" class="form-control"></div></div>
                            <div class="row p-1"><div class="col-3">EMAIL:</div><div class="col-6"><input placeholder="email" required v-model="docente.email" type="text" class="form-control"></div></div>
                            <div class="row p-1"><div class="col-3">TELEFONO:</div><div class="col-4"><input placeholder="telefono" required v-model="docente.telefono" type="text" class="form-control"></div></div>
                            <div class="row p-1"><div class="col-3">ESCALAFON:</div><div class="col-4"><select required title="Seleccione un escalafon" v-model="docente.escalafon" class="form-select"><option value="tecnico">Tecnico</option><option value="profesor">Profesor</option><option value="ingeniero">Licenciado/Ingeniero</option><option value="maestria">Maestria</option><option value="doctor">Doctor</option></select></div></div>
                        </div>
                        <div class="card-footer"><div class="row"><div class="col text-center"><button type="submit" id="btnGuardarDocente" class="btn btn-primary">GUARDAR</button><button type="reset" id="btnCancelarDocente" class="btn btn-warning">NUEVO</button><button type="button" @click="buscarDocente" id="btnBuscarDocente" class="btn btn-success">BUSCAR</button></div></div></div>
                    </div>
                </form>
            </div>
        </div>
    `
};
