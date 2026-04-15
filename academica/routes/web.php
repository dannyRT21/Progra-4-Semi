<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/bienvenida/{nombre}', function ($snombre) {
    return '<h1>Bienvenido a mi pagina, hola ' . $snombre . ', como estas?</h1>';
});
