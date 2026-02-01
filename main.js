document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fmrRegistroAlumnos");
    const tabla = document.querySelector("#tblAlumnos tbody");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        guardarAlumno();
    });

    tabla.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row || !row.dataset.alumno) return;
        const alumno = JSON.parse(row.dataset.alumno);
        cargarAlumnoEnFormulario(alumno);
        
    });

    tabla.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-del");
    if (btn) {
        const id = btn.dataset.id;
        localStorage.removeItem(id);
        mostrarAlumnos();
        return;
    }

    const row = e.target.closest("tr");
    if (row && row.dataset.alumno) {
        const alumno = JSON.parse(row.dataset.alumno);
        cargarAlumnoEnFormulario(alumno);
    }
});

    mostrarAlumnos();
});

function mostrarAlumnos() {
    const tabla = document.querySelector("#tblAlumnos tbody");
    tabla.innerHTML = "";

    Object.keys(localStorage).forEach((key) => {
        const alumno = JSON.parse(localStorage.getItem(key));
        if (alumno?.codigo && alumno?.nombre) {
            const fila = document.createElement("tr");
            fila.dataset.alumno = JSON.stringify(alumno);
            fila.innerHTML = `
                <td>${alumno.nombre}</td>
                <td>${alumno.codigo}</td>
                <td>${alumno.telefono}</td>
                <td>${alumno.direccion}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-del" data-id="${alumno.id}">DEL</button>
                </td>
            `;
            tabla.appendChild(fila);
        }
    });
}

function guardarAlumno() {
    const codigo = document.getElementById("txtCodigo").value.trim();
    const nombre = document.getElementById("txtnombreAlumno").value.trim();
    const telefono = document.getElementById("txtTelefono").value.trim();
    const direccion = document.getElementById("txtdireccion").value.trim();

    if (!codigo || !nombre) {
        alert("Los campos Código y Nombre son obligatorios.");
        return;
    }

    const alumnoExistente = buscarAlumno(codigo);
    if (alumnoExistente) {
        alert(`El código ya existe: ${alumnoExistente.nombre}`);
        return;
    }

    const id = generarId();
    const alumno = { id, codigo, nombre, telefono, direccion };
    localStorage.setItem(id, JSON.stringify(alumno));
    mostrarAlumnos();
    limpiarFormulario();
}

function buscarAlumno(codigo) {
    for (const key of Object.keys(localStorage)) {
        const alumno = JSON.parse(localStorage.getItem(key));
        if (
            alumno?.codigo &&
            alumno.codigo.trim().toUpperCase() === codigo.trim().toUpperCase()
        ) {
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
}

function limpiarFormulario() {
    document.getElementById("fmrRegistroAlumnos").reset();
}

function generarId() {
    return Date.now().toString();
}
