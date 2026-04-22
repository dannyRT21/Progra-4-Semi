<template>
    <div v-draggable>
        <form
            id="frmAlumnos"
            @submit.prevent="guardarAlumno"
            @reset.prevent="limpiarFormulario"
        >
            <div class="card text-bg-dark">
                <div class="card-header">
                    <div class="d-flex justify-content-between">
                        <div class="p-1">REGISTRO DE ALUMNOS</div>
                        <div>
                            <button
                                type="button"
                                class="btn-close btn-close-white"
                                aria-label="Close"
                                @click="cerrarFormularioAlumno"
                            ></button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row p-1">
                        <div class="col-4">CODIGO:</div>
                        <div class="col-5">
                            <input
                                placeholder="codigo"
                                required
                                v-model="alumno.codigo"
                                type="text"
                                class="form-control"
                            />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">NOMBRE:</div>
                        <div class="col-8">
                            <input
                                placeholder="nombre"
                                required
                                v-model="alumno.nombre"
                                type="text"
                                class="form-control"
                            />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">DIRECCION:</div>
                        <div class="col-8">
                            <input
                                placeholder="direccion"
                                required
                                v-model="alumno.direccion"
                                type="text"
                                class="form-control"
                            />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">EMAIL:</div>
                        <div class="col-8">
                            <input
                                placeholder="email"
                                required
                                v-model="alumno.email"
                                type="text"
                                class="form-control"
                            />
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-4">TELEFONO:</div>
                        <div class="col-6">
                            <input
                                placeholder="telefono"
                                required
                                v-model="alumno.telefono"
                                type="text"
                                class="form-control"
                            />
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row">
                        <div class="col text-center">
                            <button
                                type="submit"
                                id="btnGuardarAlumno"
                                class="btn btn-primary"
                            >
                                GUARDAR</button
                            ><button
                                type="reset"
                                id="btnCancelarAlumno"
                                class="btn btn-warning"
                            >
                                NUEVO</button
                            ><button
                                type="button"
                                @click="buscarAlumno"
                                id="btnBuscarAlumno"
                                class="btn btn-success"
                            >
                                BUSCAR
                            </button>
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
            alumno: {
                idAlumno: uuidv4(),
                codigo: "",
                nombre: "",
                direccion: "",
                email: "",
                telefono: "",
            },
            accion: "nuevo",
        };
    },
    methods: {
        cerrarFormularioAlumno() {
            this.forms.alumnos.mostrar = false;
        },
        buscarAlumno() {
            this.$emit("buscar");
        },
        modificarAlumno(alumno) {
            this.accion = "modificar";
            this.alumno = { ...alumno };
        },
        async guardarAlumno() {
            let alumno = { ...this.alumno },
                metodo = "POST";
            // db.alumnos.put(alumno); // Comentado por migración a Laravel
            if (this.accion == "modificar") {
                metodo = "PUT";
            }
            axios({
                method: metodo,
                url: "alumno",
                data: alumno,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })
                .then((response) => {
                    if (response.data.msg !== "ok") {
                        alertify.error(
                            `Error al sincronizar con el servidor: ${response.data}`,
                        );
                    } else {
                        alertify.success("Registro guardado exitosamente");
                        this.limpiarFormulario();
                    }
                })
                .catch((error) => {
                    alertify.error(
                        `Error al sincronizar con el servidor: ${error}`,
                    );
                });
        },
        limpiarFormulario() {
            this.alumno = {
                idAlumno: uuidv4(),
                codigo: "",
                nombre: "",
                direccion: "",
                email: "",
                telefono: "",
            };
            this.accion = "nuevo";
        },
    },
};
</script>
