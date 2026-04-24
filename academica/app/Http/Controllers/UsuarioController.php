<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Usuario::query();
        
        if ($request->has('nombre') || $request->has('dui')) {
            $query->where(function($q) use ($request) {
                if ($request->has('nombre')) {
                    $q->orWhere('nombre', 'like', '%' . $request->nombre . '%');
                }
                if ($request->has('dui')) {
                    $q->orWhere('dui', 'like', '%' . $request->dui . '%');
                }
            });
        }
        
        return $query->get();
    }

    public function findByDui(Request $request)
    {
        $usuario = Usuario::where('dui', $request->dui)->first();
        if ($usuario) {
            return response()->json($usuario, 200);
        }
        return response()->json(['msg' => 'Usuario no encontrado'], 404);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $data['password'] = Hash::make($request->password);
        Usuario::create($data);
        return response()->json(['msg'=>'ok'], 200);
    }

    public function update(Request $request, Usuario $usuario)
    {
        $data = [
            'nombre' => $request->nombre,
            'dui' => $request->dui,
            'telefono' => $request->telefono,
            'email' => $request->email
        ];
        
        if (!empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }

        $usuario::where('idUsuario', $request->idUsuario)->update($data);
        return response()->json(['msg'=>'ok', 'idUsuario'=>$request->idUsuario], 200);
    }

    public function destroy(Request $request, Usuario $usuario)
    {
        $usuario::where('idUsuario', $request['idUsuario'])->delete();
        return response()->json(['msg'=> 'ok', 'idUsuario'=>$request['idUsuario']], 200);
    }
}
