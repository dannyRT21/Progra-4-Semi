<template>
    <div v-draggable class="ventana-arrastrable">
         <div class="card text-bg-dark mb-3 border-secondary shadow-lg">
             <div class="card-header"><div class="d-flex justify-content-between"><div class="p-1">BUSQUEDA DE USUARIOS</div><div><button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioBusquedaUsuarios"></button></div></div></div>
             <div class="card-body">
                 <div class="table-container table-responsive">
                     <table class="table table-dark table-striped table-hover" id="tblUsuarios">
                     <thead>
                         <tr><th colspan="5"><input autocomplete="off" type="search" @keyup="obtenerUsuarios()" v-model="buscar" placeholder="Buscar por nombre o dui" class="form-control"></th></tr>
                         <tr><th>NOMBRE</th><th>DUI</th><th>TELEFONO</th><th>EMAIL</th><th></th></tr>
                     </thead>
                     <tbody>
                         <tr v-for="usuario in usuarios" :key="usuario.idUsuario" @click="modificarUsuario(usuario)">
                             <td>{{ usuario.nombre }}</td><td>{{ usuario.dui }}</td><td>{{ usuario.telefono }}</td><td>{{ usuario.email }}</td>
                             <td><button class="btn btn-danger" @click="eliminarUsuario(usuario, $event)">DEL</button></td>
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
                usuarios:[],
                buscar:''
            }
        },
        methods:{
            cerrarFormularioBusquedaUsuarios() {
                this.forms.buscar_usuarios.mostrar = false;
            },
            modificarUsuario(usuario){
                this.$emit('modificar', usuario);
            },
            eliminarUsuario(usuario, event){
                event.stopPropagation();
                alertify.confirm('¿Está seguro de eliminar el usuario?', async ()=>{ 
                    axios({
                        method:'DELETE',
                        url:'usuario',
                        data:usuario,
                        headers:{
                            'Content-Type':'application/json',
                            'Accept':'application/json'
                        }
                    }).then(response=>{
                        if(response.data.msg !== 'ok'){
                            alertify.error(`Error al sincronizar con el servidor: ${response.data.msg}`);
                        }else{
                            alertify.error('Registro eliminado exitosamente');
                            this.obtenerUsuarios();
                        }
                    }).catch(error=>{
                        alertify.error(`Error al sincronizar con el servidor: ${error}`);
                    });
                });
            },
            async obtenerUsuarios(){
                let url = 'usuario';
                if(this.buscar.length > 0){
                    url += `?nombre=${this.buscar}&dui=${this.buscar}`;
                }
                axios({
                    method:'GET',
                    url:url,
                    headers:{
                        'Content-Type':'application/json',
                        'Accept':'application/json'
                    }
                }).then(response=>{
                    let datos = response.data;
                    if(this.buscar.length > 0){
                        this.usuarios = datos.filter(usuario=>{
                            return usuario.nombre.toLowerCase().includes(this.buscar.toLowerCase()) || 
                                usuario.dui.toLowerCase().includes(this.buscar.toLowerCase());
                        });
                    } else {
                        this.usuarios = datos;
                    }
                }).catch(error=>{
                    alertify.error(`Error al sincronizar con el servidor: ${error}`);
                });
            }
        },
        created(){
            this.obtenerUsuarios();
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
