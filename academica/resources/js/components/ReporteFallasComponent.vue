<template>
    <div v-draggable class="ventana-arrastrable">
        <div class="card text-bg-dark border-secondary shadow-lg">
            <div class="card-header">
                <div class="d-flex justify-content-between">
                    <div class="p-1">REPORTE DE FALLAS - HIDROVIDA</div>
                    <div>
                        <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="cerrarFormularioReportes"></button>
                    </div>
                </div>
            </div>
            
            <!-- Vista: Validar DUI -->
            <div class="card-body" v-if="!usuarioValidado && !mostrarBuscador">
                <div class="alert alert-info">
                    Bienvenidx al reporte de fallas del servicio de agua llamado Hidrovida. Para reportar una falla debes ser un usuario registrado en esta página o utilizar el servicio. (Esto se hace para fines de fiabilidad.)
                </div>
                <div class="row p-1 align-items-center">
                    <div class="col-12 mb-2">Ingresa tu número de DUI:</div>
                    <div class="col-8">
                        <input placeholder="12345678-9" v-model="duiIngresado" @input="mascaraDui" type="text" class="form-control" maxlength="10" />
                    </div>
                    <div class="col-4">
                        <button type="button" class="btn btn-primary w-100" @click="validarDui">Validar DUI</button>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <button type="button" @click="mostrarBuscador = true" class="btn btn-success">Ver Reportes Existentes</button>
                </div>
            </div>

            <!-- Vista: Formulario de Reporte -->
            <div class="card-body" v-else-if="usuarioValidado && !mostrarBuscador">
                <div class="alert alert-success mb-3 p-2">
                    <strong>Eres:</strong> {{ usuario.nombre }}<br>
                    <strong>Correo:</strong> {{ usuario.email }}<br>
                    <strong>Teléfono:</strong> {{ usuario.telefono }}
                </div>
                
                <form id="frmReportes" @submit.prevent="confirmarEnvio" @reset.prevent="limpiarFormulario">
                    <div class="row p-1">
                        <div class="col-12 mb-1">Concepto / Descripción del problema:</div>
                        <div class="col-12">
                            <textarea required v-model="reporte.concepto" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="row p-1">
                        <div class="col-4">Foto (Opcional):</div>
                        <div class="col-8">
                            <input type="file" ref="fotoInput" @change="manejarFoto" class="form-control" accept="image/*" />
                            
                            <!-- Preview de imagen local -->
                            <div v-if="fotoPreviewUrl" class="mt-2 text-center p-1 bg-dark border rounded">
                                <img :src="fotoPreviewUrl" alt="Vista previa" class="img-fluid rounded" style="max-height: 150px; object-fit: contain;">
                            </div>
                            <!-- Preview de imagen ya guardada (update) -->
                            <div v-else-if="reporte.foto_path && accion === 'modificar'" class="mt-2 text-center p-1 bg-dark border rounded">
                                <img :src="reporte.foto_path" alt="Vista previa actual" class="img-fluid rounded" style="max-height: 150px; object-fit: contain;">
                            </div>
                        </div>
                    </div>

                    <div class="row p-1 align-items-center">
                        <div class="col-4">Ubicación GPS:</div>
                        <div class="col-4">
                            <button type="button" class="btn btn-secondary btn-sm w-100" @click="obtenerUbicacion" :disabled="obteniendoUbicacion">
                                <span v-if="obteniendoUbicacion" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span v-else>Obtener ubicación</span>
                            </button>
                        </div>
                        <div class="col-4 text-center">
                            <a v-if="reporte.maps_url" :href="reporte.maps_url" target="_blank" class="text-info">Ver en Maps</a>
                        </div>
                    </div>
                    
                    <div class="row p-1">
                        <div class="col-4">Dirección/Referencia:</div>
                        <div class="col-8">
                            <input type="text" v-model="reporte.direccion_texto" class="form-control" placeholder="Ej: Frente al parque" />
                        </div>
                    </div>

                    <div class="row p-1">
                        <div class="col-4">Fecha:</div>
                        <div class="col-8">
                            <input type="date" required v-model="reporte.fecha" class="form-control" />
                        </div>
                    </div>

                    <div class="row mt-3">
                        <div class="col text-center">
                            <button type="submit" class="btn btn-primary">ENVIAR REPORTE</button>
                            <button type="button" @click="cancelarReporte" class="btn btn-warning">CANCELAR</button>
                            <button type="button" @click="mostrarBuscador = true" class="btn btn-success">VER REPORTES</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Vista: Buscador -->
            <div class="card-body" v-else-if="mostrarBuscador">
                <div class="d-flex justify-content-between mb-2">
                    <h5>BUSCADOR DE REPORTES</h5>
                    <button class="btn btn-sm btn-primary" @click="mostrarBuscador = false; usuarioValidado = false;">+ Nuevo Reporte</button>
                </div>
                <div class="table-container table-responsive">
                    <table class="table table-dark table-striped table-hover">
                        <thead>
                            <tr>
                                <th colspan="6">
                                    <input autocomplete="off" type="search" @keyup="obtenerReportes()" v-model="buscar" placeholder="Buscar por Nombre o DUI" class="form-control">
                                </th>
                            </tr>
                            <tr>
                                <th>FECHA</th>
                                <th>DUI / NOMBRE</th>
                                <th>CONCEPTO</th>
                                <th>UBICACIÓN</th>
                                <th>FOTO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="rep in reportes" :key="rep.idReporte">
                                <td>{{ rep.fecha }}</td>
                                <td>{{ rep.dui }}<br><small>{{ rep.nombre }}</small></td>
                                <td>{{ rep.concepto.substring(0, 30) }}...</td>
                                <td>
                                    <span v-if="rep.direccion_texto">{{ rep.direccion_texto }}<br></span>
                                    <a v-if="rep.maps_url" :href="rep.maps_url" target="_blank" class="text-info">Link Maps</a>
                                </td>
                                <td>
                                    <a v-if="rep.foto_path" :href="rep.foto_path" target="_blank">
                                        <img :src="rep.foto_path" alt="Foto" class="img-thumbnail" style="max-height: 60px; max-width: 80px; object-fit: cover;">
                                    </a>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-info me-1" @click="modificarReporte(rep)">EDIT</button>
                                    <button class="btn btn-sm btn-danger" @click="eliminarReporte(rep, $event)">DEL</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import alertify from "alertifyjs";

export default {
    props: ["forms"],
    data() {
        let hoy = new Date().toISOString().split('T')[0];
        return {
            usuarioValidado: false,
            mostrarBuscador: false,
            duiIngresado: "",
            usuario: {},
            reporte: {
                idReporte: "",
                idUsuario: "",
                concepto: "",
                direccion_texto: "",
                lat: null,
                lng: null,
                maps_url: "",
                fecha: hoy,
            },
            fotoFile: null,
            fotoPreviewUrl: null,
            obteniendoUbicacion: false,
            accion: "nuevo",
            reportes: [],
            buscar: "",
        };
    },
    methods: {
        mascaraDui(e) {
            let valor = e.target.value.replace(/\D/g, "");
            if (valor.length > 8) {
                valor = valor.slice(0, 8) + "-" + valor.slice(8, 9);
            }
            this.duiIngresado = valor;
        },
        cerrarFormularioReportes() {
            this.forms.reportefallas.mostrar = false;
        },
        async validarDui() {
            if (this.duiIngresado.length !== 10) {
                alertify.error("El DUI debe tener el formato 12345678-9");
                return;
            }
            try {
                let response = await axios.get(`usuario/por-dui?dui=${this.duiIngresado}`);
                this.usuario = response.data;
                this.reporte.idUsuario = this.usuario.idUsuario;
                this.usuarioValidado = true;
                this.accion = "nuevo";
                alertify.success(`Bienvenido ${this.usuario.nombre}`);
            } catch (error) {
                alertify.error("Error: No existe ningún usuario registrado con ese DUI.");
            }
        },
        obtenerUbicacion() {
            if (navigator.geolocation) {
                this.obteniendoUbicacion = true;
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.reporte.lat = position.coords.latitude;
                        this.reporte.lng = position.coords.longitude;
                        this.reporte.maps_url = `https://www.google.com/maps?q=${this.reporte.lat},${this.reporte.lng}`;
                        this.obteniendoUbicacion = false;
                        alertify.success("Ubicación obtenida correctamente.");
                    },
                    (error) => {
                        this.obteniendoUbicacion = false;
                        alertify.error("Error al obtener la ubicación. Permisos denegados.");
                    }
                );
            } else {
                alertify.error("Geolocalización no soportada por el navegador.");
            }
        },
        manejarFoto(event) {
            const file = event.target.files[0];
            this.fotoFile = file;
            if (file) {
                this.fotoPreviewUrl = URL.createObjectURL(file);
            } else {
                if (this.fotoPreviewUrl) URL.revokeObjectURL(this.fotoPreviewUrl);
                this.fotoPreviewUrl = null;
            }
        },
        confirmarEnvio() {
            let imgPreviewHtml = "";
            if (this.fotoPreviewUrl) {
                imgPreviewHtml = `<img src="${this.fotoPreviewUrl}" style="max-height: 180px; max-width: 100%; object-fit: contain; margin-top: 10px; border-radius: 8px;" alt="Vista previa">`;
            } else if (this.reporte.foto_path && this.accion === 'modificar') {
                imgPreviewHtml = `<img src="${this.reporte.foto_path}" style="max-height: 180px; max-width: 100%; object-fit: contain; margin-top: 10px; border-radius: 8px;" alt="Vista previa actual">`;
            }

            let htmlMsg = `
                <div style="text-align: left;">
                    <p><strong>Vas a enviar el siguiente reporte:</strong></p>
                    <ul>
                        <li><strong>Usuario:</strong> ${this.usuario.nombre} (${this.usuario.dui})</li>
                        <li><strong>Concepto:</strong> ${this.reporte.concepto}</li>
                        <li><strong>Fecha:</strong> ${this.reporte.fecha}</li>
                        <li><strong>Ubicación:</strong> ${this.reporte.direccion_texto || 'No especificada'} ${this.reporte.maps_url ? '(Coordenadas adjuntas)' : ''}</li>
                        <li><strong>Foto:</strong> ${this.fotoFile || (this.reporte.foto_path && this.accion === 'modificar') ? 'Adjunta' : 'Ninguna'}</li>
                    </ul>
                    ${imgPreviewHtml ? `<div style="text-align: center;">${imgPreviewHtml}</div>` : ''}
                </div>
            `;
            
            alertify.confirm('Confirmación de Reporte', htmlMsg, 
                () => { this.enviarReporte(); },
                () => { alertify.error('Envío cancelado'); }
            ).set('labels', {ok:'Enviar', cancel:'Cancelar'});
        },
        async enviarReporte() {
            let formData = new FormData();
            formData.append("idUsuario", this.reporte.idUsuario);
            formData.append("concepto", this.reporte.concepto);
            formData.append("fecha", this.reporte.fecha);
            
            if (!this.reporte.idReporte) {
                this.reporte.idReporte = uuidv4();
            }
            formData.append("idReporte", this.reporte.idReporte);
            
            if (this.reporte.direccion_texto) formData.append("direccion_texto", this.reporte.direccion_texto);
            if (this.reporte.lat) formData.append("lat", this.reporte.lat);
            if (this.reporte.lng) formData.append("lng", this.reporte.lng);
            if (this.reporte.maps_url) formData.append("maps_url", this.reporte.maps_url);
            if (this.fotoFile) formData.append("foto", this.fotoFile);

            let url = "reporte-falla";
            if (this.accion === "modificar") {
                formData.append("_method", "PUT");
            }

            try {
                let response = await axios.post(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (response.data.msg === "ok") {
                    alertify.success("Reporte guardado exitosamente");
                    this.limpiarFormulario();
                    this.obtenerReportes();
                    this.mostrarBuscador = true;
                } else {
                    alertify.error(`Error al guardar: ${response.data.msg}`);
                }
            } catch (error) {
                alertify.error(`Error de servidor: ${error}`);
            }
        },
        cancelarReporte() {
            this.limpiarFormulario();
            this.usuarioValidado = false;
        },
        limpiarFormulario() {
            let hoy = new Date().toISOString().split('T')[0];
            this.reporte = {
                idReporte: "",
                idUsuario: this.usuario.idUsuario || "",
                concepto: "",
                direccion_texto: "",
                lat: null,
                lng: null,
                maps_url: "",
                fecha: hoy,
            };
            this.fotoFile = null;
            if (this.fotoPreviewUrl) {
                URL.revokeObjectURL(this.fotoPreviewUrl);
            }
            this.fotoPreviewUrl = null;
            this.obteniendoUbicacion = false;
            if (this.$refs.fotoInput) this.$refs.fotoInput.value = "";
            this.accion = "nuevo";
        },
        async obtenerReportes() {
            let url = 'reporte-falla';
            if (this.buscar.length > 0) {
                url += `?nombre=${this.buscar}&dui=${this.buscar}`;
            }
            try {
                let response = await axios.get(url);
                this.reportes = response.data;
            } catch (error) {
                alertify.error(`Error al buscar reportes: ${error}`);
            }
        },
        modificarReporte(rep) {
            this.usuario = { nombre: rep.nombre, dui: rep.dui, telefono: rep.telefono, email: rep.email, idUsuario: rep.idUsuario };
            this.reporte = { ...rep };
            this.usuarioValidado = true;
            this.mostrarBuscador = false;
            this.accion = "modificar";
            
            // Clear current file preview
            this.fotoFile = null;
            if (this.fotoPreviewUrl) URL.revokeObjectURL(this.fotoPreviewUrl);
            this.fotoPreviewUrl = null;
            if (this.$refs.fotoInput) this.$refs.fotoInput.value = "";
        },
        eliminarReporte(rep, event) {
            event.stopPropagation();
            alertify.confirm('¿Está seguro de eliminar el reporte?', async () => { 
                try {
                    let response = await axios.delete('reporte-falla', { data: { idReporte: rep.idReporte } });
                    if (response.data.msg === 'ok') {
                        alertify.success('Reporte eliminado exitosamente');
                        this.obtenerReportes();
                    } else {
                        alertify.error('Error al eliminar');
                    }
                } catch (error) {
                    alertify.error(`Error de servidor: ${error}`);
                }
            });
        }
    },
    created() {
        this.obtenerReportes();
    }
};
</script>

<style scoped>
.ventana-arrastrable {
    width: 95vw;
    max-width: 800px;
    top: 5vh;
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
