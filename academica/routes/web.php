<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlumnoController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('/bienvenida/{nombre}', function ($nombre) {
    return '<h1>Bienvenido a mi pagina, hola '.$nombre.', como estas...</h1>';
});
Route::controller(AlumnoController::class)->group(function () {
    Route::get('/alumno', 'index');
    Route::post('/alumno', 'store');
    Route::put('/alumno', 'update');
    Route::delete('/alumno', 'destroy');
});