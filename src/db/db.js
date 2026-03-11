const Dexie = window.Dexie;

if (!Dexie) {
  throw new Error("Dexie no está cargado. Revisa que el script de Dexie esté antes de src/main.js en index.html");
}

export class Database extends Dexie {
  constructor() {
    super("db_USSS025824");

    this.version(1).stores({
      clientes: "++idCliente, codigo, nombre, direccion, zona",
      lecturas: "++idLectura, cliente, fecha, lectura_anterior, lectura_actual, pago",
    });

    this.version(2).stores({
      clientes: "++idCliente, codigo, nombre, direccion, zona",
      lecturas: "++idLectura, codigoCliente, cliente, fecha, lectura_anterior, lectura_actual, pago",
    });

    this.clientes = this.table("clientes");
    this.lecturas = this.table("lecturas");
  }
}

export const db = new Database();

export async function initDb() {
  await db.open();
  return db;
}
