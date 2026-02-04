document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fmrRegistroAlumnos");
    const tabla = document.querySelector("#tblAlumnos tbody");
    const inputBusqueda = document.getElementById("txtBarradeBusqueda");
    inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.trim().toUpperCase();
    const resultados = buscarAlumnos(texto);
    mostrarAlumnos(resultados);
});

    let editingId = null;

    const inputCodigo = document.getElementById("txtCodigo");
    const inputTelefono = document.getElementById("txtTelefono");

    inputCodigo.addEventListener("input", () => {
        let v = inputCodigo.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const letras = v.replace(/[^A-Z]/g, "").slice(0, 4);
        const numeros = v.replace(/[^0-9]/g, "").slice(0, 6);
        inputCodigo.value = letras + numeros;
    });

    inputCodigo.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        let v = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const letras = v.replace(/[^A-Z]/g, "").slice(0, 4);
        const numeros = v.replace(/[^0-9]/g, "").slice(0, 6);
        inputCodigo.value = letras + numeros;
    });

    inputTelefono.addEventListener("input", () => {
        let digits = inputTelefono.value.replace(/\D/g, "").slice(0, 8);
        inputTelefono.value = digits.length <= 4 ? digits : digits.slice(0, 4) + "-" + digits.slice(4);
    });

    inputTelefono.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        let digits = text.replace(/\D/g, "").slice(0, 8);
        inputTelefono.value = digits.length <= 4 ? digits : digits.slice(0, 4) + "-" + digits.slice(4);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        guardarAlumno();
    });

    tabla.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-del");
        if (btn) {
            const id = btn.dataset.id;
            if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;
            localStorage.removeItem(id);
            mostrarAlumnos();
            if (editingId === id) {
                editingId = null;
                limpiarFormulario();
            }
            return;
        }

        const row = e.target.closest("tr");
        if (row && row.dataset.alumno) {
            const alumno = JSON.parse(row.dataset.alumno);
            cargarAlumnoEnFormulario(alumno);
            editingId = alumno.id;
            const card = document.getElementById("draggableCard");
            if (card) card.style.display = "block";
        }
    });

    document.getElementById("selectDepartamento").addEventListener("change", function () {
        const depto = this.value;
        const selectMunicipio = document.getElementById("selectMunicipio");
        selectMunicipio.innerHTML = '<option value="">Selecciona un municipio</option>';

        if (departamentosYMunicipios[depto]) {
            departamentosYMunicipios[depto].forEach(municipio => {
                const option = document.createElement("option");
                option.value = municipio;
                option.textContent = municipio;
                selectMunicipio.appendChild(option);
            });
        }
    });

    form.addEventListener("reset", () => {
        editingId = null;
    });

    // 🔍 BÚSQUEDA EN TIEMPO REAL
    inputBusqueda.addEventListener("input", () => {
        const texto = inputBusqueda.value.trim().toUpperCase();
        const [codigo, ...resto] = texto.split(" ");
        const departamento = resto.join(" ").trim();
        const resultados = buscarPorCodigoYDepartamento(codigo, departamento);
        mostrarAlumnos(resultados);
    });

    mostrarAlumnos();

    // === FUNCIONES ===

    function mostrarAlumnos(lista = null) {
        const tabla = document.querySelector("#tblAlumnos tbody");
        tabla.innerHTML = "";

        const alumnos = lista || Object.keys(localStorage)
            .map(key => JSON.parse(localStorage.getItem(key)))
            .filter(alumno => alumno?.codigo && alumno?.nombre);

        alumnos.forEach(alumno => {
            const fila = document.createElement("tr");
            fila.dataset.alumno = JSON.stringify(alumno);
            fila.innerHTML = `
                <td>${alumno.nombre}</td>
                <td>${alumno.codigo}</td>
                <td>${alumno.departamento}</td>
                <td>${alumno.municipio}</td>
                <td>${alumno.fechaNacimiento}</td>
                <td>${alumno.sexo}</td>
                <td>${alumno.telefono}</td>
                <td>${alumno.direccion}</td>
                <td><button class="btn btn-danger btn-sm btn-del" data-id="${alumno.id}">DEL</button></td>
            `;
            tabla.appendChild(fila);
        });
    }

    function guardarAlumno() {
        const codigo = document.getElementById("txtCodigo").value.trim().toUpperCase();
        const nombre = document.getElementById("txtnombreAlumno").value.trim();
        const telefono = document.getElementById("txtTelefono").value.trim();
        const direccion = document.getElementById("txtdireccion").value.trim();
        const departamento = document.getElementById("selectDepartamento").value;
        const municipio = document.getElementById("selectMunicipio").value;
        const fechaNacimiento = document.getElementById("txtFechaNacimiento").value;
        const sexo = document.querySelector("input[name='sexo']:checked")?.value || "";

        if (!codigo || !nombre || !departamento || !municipio || !fechaNacimiento || !sexo || !telefono || !direccion) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        if (!/^[A-Z]{4}[0-9]{6}$/.test(codigo)) {
            alert("Código inválido. Debe ser 4 letras y 6 números (ej: USSS037323).");
            return;
        }

        if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
            alert("Teléfono inválido. Debe ser formato 1234-5678.");
            return;
        }

        const alumnoExistente = buscarAlumnoPorCodigo(codigo, editingId);
        if (alumnoExistente) {
            alert(`El código ya existe: ${alumnoExistente.nombre}`);
            return;
        }

        const id = editingId ?? generarId();

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
        mostrarAlumnos();
        editingId = null;
        limpiarFormulario();
    }

    function buscarAlumnoPorCodigo(codigo, ignoreId = null) {
        const code = codigo.trim().toUpperCase();

        for (const key of Object.keys(localStorage)) {
            const alumno = JSON.parse(localStorage.getItem(key));
            if (!alumno?.codigo) continue;

            const sameCode = alumno.codigo.trim().toUpperCase() === code;
            const sameId = ignoreId && alumno.id === ignoreId;

            if (sameCode && !sameId) {
                return alumno;
            }
        }
        return null;
    }

    function cargarAlumnoEnFormulario(alumno) {
        document.getElementById("txtCodigo").value = alumno.codigo;
        document.getElementById("txtnombreAlumno").value = alumno.nombre;
        document.getElementById("txtTelefono").value = alumno.telefono;
        document.getElementById("txtdireccion").value = alumno.direccion;
        document.getElementById("selectDepartamento").value = alumno.departamento;

        const selectMunicipio = document.getElementById("selectMunicipio");
        selectMunicipio.innerHTML = '<option value="">Selecciona un municipio</option>';

        if (departamentosYMunicipios[alumno.departamento]) {
            departamentosYMunicipios[alumno.departamento].forEach(muni => {
                const option = document.createElement("option");
                option.value = muni;
                option.textContent = muni;
                selectMunicipio.appendChild(option);
            });
        }

        selectMunicipio.value = alumno.municipio;
        document.getElementById("txtFechaNacimiento").value = alumno.fechaNacimiento;

        if (alumno.sexo === "Femenino") {
            document.getElementById("sexoF").checked = true;
        } else if (alumno.sexo === "Masculino") {
            document.getElementById("sexoM").checked = true;
        }
    }

    function limpiarFormulario() {
        document.getElementById("fmrRegistroAlumnos").reset();
    }

    function generarId() {
        return new Date().getTime().toString();
    }
    
function buscarAlumnos(texto) {
  const palabras = texto.trim().toUpperCase().split(" ");
  const resultados = [];

  for (const key of Object.keys(localStorage)) {
    const alumno = JSON.parse(localStorage.getItem(key));
    if (!alumno?.codigo || !alumno?.departamento || !alumno?.nombre) continue;

    const contenido = (alumno.codigo + " " + alumno.departamento + " " + alumno.nombre).toUpperCase();

    const coincideTodo = palabras.every(palabra => contenido.includes(palabra));
    if (coincideTodo) {
      resultados.push(alumno);
    }
  }

  return resultados;
}


});
