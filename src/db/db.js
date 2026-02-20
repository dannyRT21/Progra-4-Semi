
const Dexie = window.Dexie;

if (!Dexie) {
  throw new Error("Dexie no está cargado. Revisa que el script de Dexie esté antes de src/main.js en index.html");
}

export const db = new Dexie("db_academica");

db.version(1).stores({
  // Mantengo tablas del inge + tu tabla de alumnos con campos extra
  alumnos: "id,codigo,nombre,departamento,municipio,fechaNacimiento,sexo,telefono,direccion",
  materias: "idMateria,codigo,nombre,uv",
  docentes: "idDocente,codigo,nombre,direccion,email,telefono,escalafon"
});

// Opcional: atajo para abrir (Dexie abre solo cuando se usa, pero esto ayuda a detectar errores temprano)
export async function initDb() {
  await db.open();
  return db;
}
