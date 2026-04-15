const { createApp } = Vue;

const uuid = {
    v4() {
        if (globalThis.crypto?.randomUUID) {
            return globalThis.crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
};

(async () => {
    try {
        await globalThis.dbReady;

        createApp({
            components:{
                alumnos,
                buscar_alumnos,
                materias,
                buscar_materias,
                docentes,
                buscar_docentes
            },
            data(){
                return{
                    forms:{
                        alumnos:{mostrar:false},
                        busqueda_alumnos:{mostrar:false},
                        materias:{mostrar:false},
                        busqueda_materias:{mostrar:false},
                        docentes:{mostrar:false},
                        busqueda_docentes:{mostrar:false},
                        matriculas:{mostrar:false},
                        inscripciones:{mostrar:false}
                    }
                }
            },
            methods:{
                buscar(ventana, metodo){
                    this.$refs[ventana][metodo]();
                },
                abrirVentana(ventana){
                    this.forms[ventana].mostrar = !this.forms[ventana].mostrar;
                },
                modificar(ventana, metodo, data){
                    this.$refs[ventana][metodo](data);
                },
                async hacerBackup(){
                    const root = await navigator.storage.getDirectory();
                    const fileHandle = await root.getFileHandle('db_academica.sqlite3');
                    const file = await fileHandle.getFile();

                    // Descargar el archivo
                    const url = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'db_academica.sqlite3';
                    a.click();   
                }
            }
        }).directive('draggable', vDraggable).mount("#app");
    } catch (error) {
        console.error(error);
        if (globalThis.alertify) {
            alertify.error('No se pudo inicializar SQLite WASM + OPFS.');
        }
    }
})();
