<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReporteFalla extends Model
{
    use HasFactory;

    protected $table = 'reportes_fallas';

    protected $fillable = [
        'idReporte',
        'idUsuario',
        'concepto',
        'foto_path',
        'direccion_texto',
        'lat',
        'lng',
        'maps_url',
        'fecha'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario', 'idUsuario');
    }
}
