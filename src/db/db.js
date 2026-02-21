
const Dexie = window.Dexie;

if (!Dexie) {
  throw new Error("Dexie no está cargado. Revisa que el script de Dexie esté antes de src/main.js en index.html");
}

export const db = new Dexie("db_academica");

db.version(1).stores({
  // Mantengo tablas del inge + tu tabla de alumnos con campos extra
  alumnos: "id,codigo,nombre,departamento,municipio,fechaNacimiento,sexo,telefono,direccion,hash",
  materias: "idMateria,codigo,nombre,uv,idDocente,hash",
  docentes: "idDocente,codigo,nombre,direccion,email,telefono,escalafon,hash",

  matricula: "++idMatricula,id,fechaMatricula,ciclo,estado,carrera,ingreso,hash",
  inscripcion: "++idInscripcion,idMatricula,idMateria,fechaInscripcion",
  
  // Tabla de acceso
  usuarios: "++idUsuario,usuario,clave,nombre,hash"
  
});


export async function initDb() {
  await db.open();
  return db;
}
