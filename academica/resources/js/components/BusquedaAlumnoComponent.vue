<template>
    <div v-draggable class="ventana-arrastrable">
         <div class="card text-bg-dark mb-3 border-secondary shadow-lg">
             <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">BUSQUEDA DE ALUMNOS</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioBusquedaAlumnos"></button></div></div></div>
             <div class="card-body">
                 <div class="table-container table-responsive">
                     <table class="table table-dark table-striped table-hover" id="tblAlumnos">
                     <thead>
                         <tr><th colspan="6"><input autocomplete="off" type="search" @keyup="obtenerAlumnos()" v-model="buscar" placeholder="Buscar alumno" class="form-control"></th></tr>
                         <tr><th>CODIGO</th><th>NOMBRE</th><th>DIRECCION</th><th>EMAIL</th><th>TELEFONO</th><th>HASH</th><th></th></tr>
                     </thead>
                     <tbody>
                         <tr v-for="alumno in alumnos" :key="alumno.idAlumno" @click="modificarAlumno(alumno)">
                             <td>{{ alumno.codigo }}</td><td>{{ alumno.nombre }}</td><td>{{ alumno.direccion }}</td><td>{{ alumno.email }}</td><td>{{ alumno.telefono }}</td><td>{{ alumno.hash }}</td>
                             <td><button class="btn btn-danger" @click="eliminarAlumno(alumno, $event)">DEL</button></td>
                         </tr>
                     </tbody>
                 </table>
                 </div>
             </div>
         </div>
    </div>
</template>
<script>
    import axios from 'axios';
    import alertify from 'alertifyjs';

    export default{
        props:['forms'],
        data(){
            return{
                alumnos:[],
                buscar:''
            }
        },
        methods:{
            cerrarFormularioBusquedaAlumnos() {
                this.forms.buscar_alumnos.mostrar = false;
            },
            modificarAlumno(alumno){
                this.$emit('modificar', alumno);
            },
            eliminarAlumno(alumno){
                alertify.confirm('¿Está seguro de eliminar el alumno?', async ()=>{ 
                    axios({
                        method:'DELETE',
                        url:'alumno',
                        data:alumno,
                        headers:{
                            'Content-Type':'application/json',
                            'Accept':'application/json'
                        }
                    }).then(response=>{
                        if(response.data.msg !== 'ok'){
                            alertify.error(`Error al sincronizar con el servidor: ${response.data.msg}`);
                        }else{
                            // db.alumnos.delete(alumno.idAlumno);
                            alertify.success('Registro eliminado exitosamente');
                            this.obtenerAlumnos();
                        }
                    }).catch(error=>{
                        alertify.error(`Error al sincronizar con el servidor: ${error}`);
                    });
                });
            },
            async obtenerAlumnos(){
                axios({
                    method:'GET',
                    url:'alumno',
                    headers:{
                        'Content-Type':'application/json',
                        'Accept':'application/json'
                    }
                }).then(response=>{
                    let datos = response.data;
                    if(this.buscar.length > 0){
                        this.alumnos = datos.filter(alumno=>{
                            return alumno.codigo.toLowerCase().includes(this.buscar.toLowerCase()) || 
                                alumno.nombre.toLowerCase().includes(this.buscar.toLowerCase());
                        });
                    } else {
                        this.alumnos = datos;
                    }
                }).catch(error=>{
                    alertify.error(`Error al sincronizar con el servidor: ${error}`);
                });
            }
        },
        created(){
            this.obtenerAlumnos();
        }
    }
</script>

<style scoped>
.ventana-arrastrable {
    width: 95vw;
    max-width: 800px;
    top: 15vh;
    left: calc(50% - 400px);
    border-radius: 8px;
    transition: box-shadow 0.3s ease;
}

.ventana-arrastrable:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.7);
}

.card {
    border-radius: 8px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    background-color: rgba(33, 37, 41, 0.95) !important;
}

.table-container {
    max-height: 50vh;
    overflow-y: auto;
}

/* Custom scrollbar para la tabla */
.table-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.table-container::-webkit-scrollbar-track {
    background: #212529; 
}
.table-container::-webkit-scrollbar-thumb {
    background: #495057; 
    border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb:hover {
    background: #6c757d; 
}

@media (max-width: 850px) {
    .ventana-arrastrable {
        left: 2.5vw;
    }
}
</style>