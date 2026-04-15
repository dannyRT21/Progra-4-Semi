<?php
include('../../Config/Config.php');
extract($_REQUEST);

$alumnos = $alumnos ?? '[]';
$accion = $accion ?? '';

$class_alumnos = new alumnos($conexion);
echo json_encode($class_alumnos->recibir_datos($alumnos));

class alumnos
{
    private $datos = [], $db, $respuesta = ['msg' => 'ok'];

    public function __construct($conexion)
    {
        $this->db = $conexion;
    }
    public function recibir_datos($alumnos)
    {
        global $accion;
        if ($accion === 'consultar') {
            return $this->administrar_alumnos();
        } else {
            $this->datos = json_decode($alumnos, true);
            return $this->validar_datos();
        }
    }
    private function validar_datos()
    {
        if (empty($this->datos['codigo'])) {
            $this->respuesta['msg'] = 'El codigo es requerido';
        }
        if (empty($this->datos['nombre'])) {
            $this->respuesta['msg'] = 'El nombre es requerido';
        }
        return $this->administrar_alumnos();
    }
    private function administrar_alumnos()
    {
        global $accion;
        if ($this->respuesta['msg'] !== 'ok') {
            return $this->respuesta;
        }
        if ($accion === 'nuevo') {
            return $this->db->consultaSQL(
                'INSERT INTO alumnos (idAlumno, codigo, nombre, fechaNacimiento, direccion, telefono, sexo, hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                $this->datos['idAlumno'],
                $this->datos['codigo'],
                $this->datos['nombre'],
                $this->datos['fechaNacimiento'],
                $this->datos['direccion'],
                $this->datos['telefono'],
                $this->datos['sexo'],
                $this->datos['hash']
            );
        } else if ($accion === 'modificar') {
            return $this->db->consultaSQL(
                'UPDATE alumnos SET codigo = ?, nombre = ?, fechaNacimiento = ?, direccion = ?, telefono = ?, sexo = ?, hash = ? WHERE idAlumno = ?',
                $this->datos['codigo'],
                $this->datos['nombre'],
                $this->datos['fechaNacimiento'],
                $this->datos['direccion'],
                $this->datos['telefono'],
                $this->datos['sexo'],
                $this->datos['hash'],
                $this->datos['idAlumno']
            );
        } else if ($accion === 'eliminar') {
            return $this->db->consultaSQL('
                DELETE FROM alumnos 
                WHERE idAlumno = ?
            ', $this->datos['idAlumno']);
        } else if ($accion === 'consultar') {
            $this->db->consultaSQL('
                SELECT idAlumno, codigo, nombre, fechaNacimiento, direccion, telefono, sexo, hash 
                FROM alumnos
            ');
            return $this->db->obtener_datos();
        }
    }
}
