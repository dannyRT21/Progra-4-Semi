<?php
include('../../Config/Config.php');
extract($_REQUEST);

$docentes = $docentes ?? '[]';
$accion = $accion ?? '';

$class_docentes = new docentes($conexion);
echo json_encode($class_docentes->recibir_datos($docentes));

class docentes
{
    private $datos = [], $db, $respuesta = ['msg' => 'ok'];

    public function __construct($conexion)
    {
        $this->db = $conexion;
    }
    public function recibir_datos($docentes)
    {
        global $accion;
        if ($accion === 'consultar') {
            return $this->administrar_docentes();
        } else {
            $this->datos = json_decode($docentes, true);
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
        if (empty($this->datos['dui'])) {
            $this->respuesta['msg'] = 'El DUI es requerido';
        }
        return $this->administrar_docentes();
    }
    private function administrar_docentes()
    {
        global $accion;
        if ($this->respuesta['msg'] !== 'ok') {
            return $this->respuesta;
        }
        if ($accion === 'nuevo') {
            return $this->db->consultaSQL(
                'INSERT INTO docentes (idDocente, codigo, nombre, dui, email, telefono, direccion, escalafon, hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                $this->datos['idDocente'],
                $this->datos['codigo'],
                $this->datos['nombre'],
                $this->datos['dui'],
                $this->datos['email'],
                $this->datos['telefono'],
                $this->datos['direccion'],
                $this->datos['escalafon'],
                $this->datos['hash']
            );
        } else if ($accion === 'modificar') {
            return $this->db->consultaSQL(
                'UPDATE docentes SET codigo = ?, nombre = ?, dui = ?, email = ?, telefono = ?, direccion = ?, escalafon = ?, hash = ? WHERE idDocente = ?',
                $this->datos['codigo'],
                $this->datos['nombre'],
                $this->datos['dui'],
                $this->datos['email'],
                $this->datos['telefono'],
                $this->datos['direccion'],
                $this->datos['escalafon'],
                $this->datos['hash'],
                $this->datos['idDocente']
            );
        } else if ($accion === 'eliminar') {
            return $this->db->consultaSQL('
                DELETE FROM docentes 
                WHERE idDocente = ?
            ', $this->datos['idDocente']);
        } else if ($accion === 'consultar') {
            $this->db->consultaSQL('
                SELECT idDocente, codigo, nombre, dui, email, telefono, direccion, escalafon, hash 
                FROM docentes
            ');
            return $this->db->obtener_datos();
        }
    }
}
