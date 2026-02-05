const { createApp } = Vue;

createApp({
    data() {
        return {
            cargandoEdicion: false,
            mostrarFormulario: false,
            editingId: null,
            buscar: "",
            departamentos: [],
            municipios: [],
            alumnos: [],
            form: {
                nombre: "",
                codigo: "",
                departamento: "",
                municipio: "",
                fechaNacimiento: "",
                telefono: "",
                direccion: "",
                sexo: ""
            }
        };
    },

    computed: {
        alumnosFiltrados() {
            const texto = (this.buscar || "").trim().toUpperCase();
            if (!texto) return this.alumnos;
            const palabras = texto.split(/\s+/).filter(Boolean);
            return this.alumnos.filter((a) => {
                if (!a?.codigo || !a?.departamento || !a?.nombre) return false;
                const contenido = `${a.codigo} ${a.departamento} ${a.nombre}`.toUpperCase();
                return palabras.every(p => contenido.includes(p));
            });
        }
    },
                        
    watch: {
        "form.codigo"(val) {
  if (this.editingId !== null) return; 
  const v = (val ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const letras = v.replace(/[^A-Z]/g, "").slice(0, 4);
  const numeros = v.replace(/[^0-9]/g, "").slice(0, 6);
  const nuevo = letras + numeros;
  if (nuevo !== val) this.form.codigo = nuevo;
},


        "form.telefono"(val) {
            const digits = (val ?? "").replace(/\D/g, "").slice(0, 8);
            const nuevo = digits.length <= 4 ? digits : digits.slice(0, 4) + "-" + digits.slice(4);
            if (nuevo !== val) this.form.telefono = nuevo;
        },

        "form.departamento"(depto) {
            this.cargarMunicipios(depto);
            if (!this.cargandoEdicion) {
                this.form.municipio = "";
            }
        }
    },

    methods: {
        filtrarAlumnos() {},

        onDepartamentoChange() {},

        cargarMunicipios(depto) {
            if (typeof departamentosYMunicipios !== "object" || !departamentosYMunicipios) {
                this.municipios = [];
                return;
            }
            const arr = departamentosYMunicipios[depto];
            this.municipios = Array.isArray(arr) ? arr : [];
        },

        cargarAlumnos() {
            const alumnos = [];
            for (const key of Object.keys(localStorage)) {
                try {
                    const obj = JSON.parse(localStorage.getItem(key));
                    if (obj?.codigo && obj?.nombre) alumnos.push(obj);
                } catch {
                }
            }
            this.alumnos = alumnos;
        },

        seleccionarAlumno(a) {
            this.editingId = a.id;
            this.cargandoEdicion = true;
            this.form = {
                nombre: a.nombre ?? "",
                codigo: a.codigo ?? "",
                departamento: a.departamento ?? "",
                municipio: "",
                fechaNacimiento: a.fechaNacimiento ?? "",
                telefono: a.telefono ?? "",
                direccion: a.direccion ?? "",
                sexo: a.sexo ?? ""
            };
            this.cargarMunicipios(this.form.departamento);
            this.form.municipio = a.municipio ?? "";
            this.mostrarFormulario = true;
            this.$nextTick(() => {
                this.cargandoEdicion = false;
            });
        },

        eliminarAlumno(id, e) {
            if (e) e.stopPropagation();
            if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;
            localStorage.removeItem(id);
            this.cargarAlumnos();
            if (this.editingId === id) {
                this.cancelarFormulario();
            }
        },
registrarAlumno() {
  const esNuevo = this.editingId === null;

 
  const codigo = esNuevo
    ? (this.form.codigo || "").trim().toUpperCase()
    : (this.form.codigo || "").trim().toUpperCase(); // lo mantienes por consistencia, pero no lo re-validas igual

  const nombre = (this.form.nombre || "").trim();
  const telefono = (this.form.telefono || "").trim();
  const direccion = (this.form.direccion || "").trim();
  const departamento = this.form.departamento || "";
  const municipio = this.form.municipio || "";
  const fechaNacimiento = this.form.fechaNacimiento || "";
  const sexo = this.form.sexo || "";

  if (!codigo || !nombre || !departamento || !municipio || !fechaNacimiento || !sexo || !telefono || !direccion) {
    alert("Por favor, completa todos los campos.");
    return;
  }

 
  if (esNuevo) {
    if (!/^[A-Z]{4}[0-9]{6}$/.test(codigo)) {
      alert("Código inválido. Debe ser 4 letras y 6 números (ej: USSS037323).");
      return;
    }

    const existente = this.buscarAlumnoPorCodigo(codigo, null);
    if (existente) {
      alert(`El código ya existe: ${existente.nombre}`);
      return;
    }
  } else {
    // ✅ En edición: opcional validar formato sin bloquear (o sí bloquear, tú decides)
    if (!/^[A-Z]{4}[0-9]{6}$/.test(codigo)) {
      alert("El código del registro está inválido. (No se puede editar el código).");
      return;
    }
  }

  if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
    alert("Teléfono inválido. Debe ser formato 1234-5678.");
    return;
  }

  const id = this.editingId ?? this.generarId();

  const alumno = {
    id,
    codigo,
    nombre,
    telefono,
    direccion,
    departamento,
    municipio,
    fechaNacimiento,
    sexo
  };

  localStorage.setItem(id, JSON.stringify(alumno));
  this.cargarAlumnos();
  this.cancelarFormulario();
},

        buscarAlumnoPorCodigo(codigo, ignoreId = null) {
            const code = (codigo ?? "").trim().toUpperCase();
            for (const key of Object.keys(localStorage)) {
                let alumno;
                try {
                    alumno = JSON.parse(localStorage.getItem(key));
                } catch {
                    continue;
                }
                if (!alumno?.codigo) continue;
                const sameCode = alumno.codigo.trim().toUpperCase() === code;
                const sameId = ignoreId && alumno.id === ignoreId;
                if (sameCode && !sameId) return alumno;
            }
            return null;
        },

        generarId() {
            return new Date().getTime().toString();
        },

        cancelarFormulario() {
            this.editingId = null;
            this.form = {
                nombre: "",
                codigo: "",
                departamento: "",
                municipio: "",
                fechaNacimiento: "",
                telefono: "",
                direccion: "",
                sexo: ""
            };
            this.mostrarFormulario = false;
        },

        initDepartamentos() {
            if (typeof departamentosYMunicipios === "object" && departamentosYMunicipios) {
                this.departamentos = Object.keys(departamentosYMunicipios);
            } else {
                this.departamentos = [];
            }
        }
    },

    mounted() {
        this.initDepartamentos();
        this.cargarAlumnos();
    }
}).mount("#app");
