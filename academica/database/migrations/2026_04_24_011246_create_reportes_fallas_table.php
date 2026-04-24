<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reportes_fallas', function (Blueprint $table) {
            $table->id();
            $table->char('idReporte', 36);
            $table->char('idUsuario', 36);
            $table->text('concepto');
            $table->char('foto_path', 255)->nullable();
            $table->char('direccion_texto', 200)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->char('maps_url', 255)->nullable();
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reportes_fallas');
    }
};
