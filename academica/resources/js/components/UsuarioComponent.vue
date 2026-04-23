<template>
    <div v-draggable class="ventana-arrastrable">
        <form id="frmUsuarios" @submit.prevent="guardarUsuario" @reset.prevent="limpiarFormulario">
            <div class="card text-bg-dark border-secondary shadow-lg">
                <div class="card-header">
                    <div class="d-flex justify-content-between">
                        <div class="p-1">REGISTRO DE USUARIOS</div>
                        <div>
                            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioUsuario"></button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row p-1">
                        <div class="col-4">NOMBRE:</div>
                        <div class="col-8">
                            <input placeholder="nombre" required v-model="usuario.nombre" type="text" class="form-control" />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">DUI:</div>
                        <div class="col-8">
                            <input placeholder="12345678-9" required v-model="usuario.dui" @input="mascaraDui" type="text" class="form-control" maxlength="10" />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">TELEFONO:</div>
                        <div class="col-8">
                            <input placeholder="1234-5678" required v-model="usuario.telefono" @input="mascaraTelefono" type="text" class="form-control" maxlength="9" />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">EMAIL:</div>
                        <div class="col-8">
                            <input placeholder="email" required v-model="usuario.email" type="email" class="form-control" />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">CONTRASEÑA:</div>
                        <div class="col-8">
                            <input placeholder="contraseña" :required="accion === 'nuevo'" v-model="usuario.password" type="password" class="form-control" />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">CONFIRMAR:</div>
                        <div class="col-8">
                            <input placeholder="confirmar contraseña" :required="accion === 'nuevo'" v-model="confirm_password" type="password" class="form-control" />
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row">
                        <div class="col text-center">
                            <button type="submit" id="btnGuardarUsuario" class="btn btn-primary">GUARDAR</button>
                            <button type="reset" id="btnCancelarUsuario" class="btn btn-warning">NUEVO</button>
                            <button type="button" @click="buscarUsuario" id="btnBuscarUsuario" class="btn btn-success">BUSCAR</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>
<script>
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import alertify from "alertifyjs";

export default {
    props: ["forms"],
    data() {
        return {
            usuario: {
                idUsuario: uuidv4(),
                nombre: "",
                dui: "",
                telefono: "",
                email: "",
                password: "",
            },
            confirm_password: "",
            accion: "nuevo",
        };
    },
    methods: {
        mascaraDui(e) {
            let valor = e.target.value.replace(/\D/g, "");
            if (valor.length > 8) {
                valor = valor.slice(0, 8) + "-" + valor.slice(8, 9);
            }
            this.usuario.dui = valor;
        },
        mascaraTelefono(e) {
            let valor = e.target.value.replace(/\D/g, "");
            if (valor.length > 4) {
                valor = valor.slice(0, 4) + "-" + valor.slice(4, 8);
            }
            this.usuario.telefono = valor;
        },
        cerrarFormularioUsuario() {
            this.forms.usuarios.mostrar = false;
        },
        buscarUsuario() {
            this.$emit("buscar");
        },
        modificarUsuario(usuario) {
            this.accion = "modificar";
            this.usuario = { ...usuario };
            this.usuario.password = ""; 
            this.confirm_password = "";
        },
        async guardarUsuario() {
            if (this.usuario.password !== this.confirm_password) {
                alertify.error("Las contraseñas no coinciden");
                return;
            }
            if (this.usuario.dui.length !== 10) {
                alertify.error("DUI no válido. Formato: 12345678-9");
                return;
            }
            if (this.usuario.telefono.length !== 9) {
                alertify.error("Teléfono no válido. Formato: 1234-5678");
                return;
            }

            let dataToSend = { ...this.usuario };
            if (this.accion === "modificar" && !dataToSend.password) {
                delete dataToSend.password; 
            }

            let metodo = this.accion == "modificar" ? "PUT" : "POST";
            
            axios({
                method: metodo,
                url: "usuario",
                data: dataToSend,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })
                .then((response) => {
                    if (response.data.msg !== "ok") {
                        alertify.error(`Error al sincronizar con el servidor: ${response.data}`);
                    } else {
                        alertify.success("Registro guardado exitosamente");
                        this.limpiarFormulario();
                    }
                })
                .catch((error) => {
                    alertify.error(`Error al sincronizar con el servidor: ${error}`);
                });
        },
        limpiarFormulario() {
            this.usuario = {
                idUsuario: uuidv4(),
                nombre: "",
                dui: "",
                telefono: "",
                email: "",
                password: "",
            };
            this.confirm_password = "";
            this.accion = "nuevo";
        },
    },
};
</script>

<style scoped>
.ventana-arrastrable {
    width: 95vw;
    max-width: 450px;
    top: 10vh;
    left: calc(50% - 225px);
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

@media (max-width: 480px) {
    .ventana-arrastrable {
        left: 2.5vw;
    }
}
</style>
