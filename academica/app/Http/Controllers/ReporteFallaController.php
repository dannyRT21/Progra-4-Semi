<?php

namespace App\Http\Controllers;

use App\Models\ReporteFalla;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReporteFallaController extends Controller
{
    public function index(Request $request)
    {
        $query = ReporteFalla::join('usuarios', 'reportes_fallas.idUsuario', '=', 'usuarios.idUsuario')
            ->select('reportes_fallas.*', 'usuarios.nombre', 'usuarios.dui', 'usuarios.telefono', 'usuarios.email');

        if ($request->has('nombre') || $request->has('dui')) {
            $query->where(function($q) use ($request) {
                if ($request->has('nombre')) {
                    $q->orWhere('usuarios.nombre', 'like', '%' . $request->nombre . '%');
                }
                if ($request->has('dui')) {
                    $q->orWhere('usuarios.dui', 'like', '%' . $request->dui . '%');
                }
            });
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'idUsuario' => 'required|exists:usuarios,idUsuario',
            'concepto' => 'required',
            'fecha' => 'required|date'
        ]);

        $data = $request->all();
        if (empty($data['idReporte'])) {
            $data['idReporte'] = (string) Str::uuid();
        }

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/reportes_fallas'), $filename);
            $data['foto_path'] = 'uploads/reportes_fallas/' . $filename;
        }

        ReporteFalla::create($data);
        return response()->json(['msg' => 'ok'], 200);
    }

    public function update(Request $request, ReporteFalla $reportefalla)
    {
        $reporte = ReporteFalla::where('idReporte', $request->idReporte)->first();
        if (!$reporte) {
            return response()->json(['msg' => 'error'], 404);
        }

        $data = $request->except(['foto', '_method']);

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/reportes_fallas'), $filename);
            $data['foto_path'] = 'uploads/reportes_fallas/' . $filename;
            
            if ($reporte->foto_path && file_exists(public_path($reporte->foto_path))) {
                unlink(public_path($reporte->foto_path));
            }
        }

        $reporte->update($data);
        return response()->json(['msg' => 'ok', 'idReporte' => $request->idReporte], 200);
    }

    public function destroy(Request $request)
    {
        $reporte = ReporteFalla::where('idReporte', $request->idReporte)->first();
        if ($reporte) {
            if ($reporte->foto_path && file_exists(public_path($reporte->foto_path))) {
                unlink(public_path($reporte->foto_path));
            }
            $reporte->delete();
        }
        return response()->json(['msg' => 'ok', 'idReporte' => $request->idReporte], 200);
    }
}
