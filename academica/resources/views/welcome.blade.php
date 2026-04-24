<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>::. Sistema Academico ..::</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <!-- CSS -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/alertify.min.css" />
    <!-- Default theme -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/default.min.css" />
    <!-- Semantic UI theme -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/semantic.min.css" />
    <!-- Bootstrap theme -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" />
</head>

<body class="antialiased">
    <div id="appSistema">
        <nav class="navbar navbar-expand-lg bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">::.. SISTEMA ACADEMICO ..::</a>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                        <a class="nav-link" href="#" @click="abrirVentana('alumnos')">Alumnos</a>
                        <a class="nav-link" href="#" @click="abrirVentana('materias')">Materias</a>
                        <a class="nav-link" href="#" @click="abrirVentana('usuarios')">Usuarios</a>
                        <a class="nav-link" href="#" @click="abrirVentana('reportefallas')">Reportes Fallas</a>

                    </div>
                </div>
            </div>
        </nav>
        <div class="container-fluid" style="position: absolute; min-height: 80vh;">
            <alumnos @buscar='buscar("buscar_alumnos","obtenerAlumnos")' :forms="forms" ref="alumnos" v-show="forms.alumnos.mostrar"></alumnos>
            <buscar_alumnos @modificar='modificar("alumnos","modificarAlumno", $event)' :forms="forms" ref="buscar_alumnos" v-show="forms.buscar_alumnos.mostrar"></buscar_alumnos>
            <usuarios @buscar='buscar("buscar_usuarios","obtenerUsuarios")' :forms="forms" ref="usuarios" v-show="forms.usuarios.mostrar"></usuarios>
            <buscar_usuarios @modificar='modificar("usuarios","modificarUsuario", $event)' :forms="forms" ref="buscar_usuarios" v-show="forms.buscar_usuarios.mostrar"></buscar_usuarios>
            <reportefallas :forms="forms" v-show="forms.reportefallas.mostrar"></reportefallas>

        </div>
    </div>

    @vite('resources/js/app.js')
</body>

</html>