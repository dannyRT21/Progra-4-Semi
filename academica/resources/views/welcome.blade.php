<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>::... SISTEMA ACADEMICO ...::</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />

    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/alertify.min.css" />

    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/default.min.css" />

    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/semantic.min.css" />

    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/bootstrap.min.css">

    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" />
</head>

<body class="antialiased">
    <div id="app">
        <nav class="navbar navbar-expand-lg bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">::.. SISTEMA ACADEMICO ..::</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                        <a class="nav-link" href="#" @click="abrirVentana('alumnos')">Alumnos</a>
                        <a class="nav-link" href="#" @click="abrirVentana('materias')">Materias</a>
                        <a class="nav-link" href="#" @click="abrirVentana('docentes')">Docentes</a>
                        <a class="nav-link" href="#" @click="abrirVentana('matriculas')">Matriculas</a>
                        <a class="nav-link" href="#" @click="abrirVentana('inscripciones')">Inscripciones</a>
                    </div>
                </div>
            </div>
        </nav>

        <div id="appSistema" class="container-fluid" style="position: absolute; min-height: 80vh;">
            <alumnos @buscar='buscar("busqueda_alumnos","obtenerAlumnos")' :forms="forms" ref="alumnos" v-show="forms.alumnos.mostrar"></alumnos>
            <buscar_alumnos @modificar='modificar("alumnos","modificarAlumno", $event)' :forms="forms" ref="busqueda_alumnos" v-show="forms.busqueda_alumnos.mostrar"></buscar_alumnos>

            <materias @buscar='buscar("busqueda_materias","obtenerMaterias")' :forms="forms" ref="materias" v-show="forms.materias.mostrar"></materias>
            <buscar_materias @modificar='modificar("materias","modificarMateria", $event)' :forms="forms" ref="busqueda_materias" v-show="forms.busqueda_materias.mostrar"></buscar_materias>

            <docentes @buscar='buscar("busqueda_docentes","obtenerDocentes")' :forms="forms" ref="docentes" v-show="forms.docentes.mostrar"></docentes>
            <buscar_docentes @modificar='modificar("docentes","modificarDocente", $event)' :forms="forms" ref="busqueda_docentes" v-show="forms.busqueda_docentes.mostrar"></buscar_docentes>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/alertify.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dexie/4.2.0/dexie.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

    <script src="{{ asset('directivas/draggable.js') }}"></script>
    <script src="{{ asset('componentes/alumnos.js') }}"></script>
    <script src="{{ asset('componentes/busqueda_alumnos.js') }}"></script>
    <script src="{{ asset('componentes/materias.js') }}"></script>
    <script src="{{ asset('componentes/busqueda_materias.js') }}"></script>
    <script src="{{ asset('componentes/docentes.js') }}"></script>
    <script src="{{ asset('componentes/busqueda_docentes.js') }}"></script>
    <script src="{{ asset('main.js') }}"></script>
</body>

</html>