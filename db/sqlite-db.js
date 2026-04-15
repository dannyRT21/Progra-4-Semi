const SQLITE_WASM_BASE = 'vendor/sqlite3-wasm/dist/sqlite-wasm-3510300/jswasm';
const SQLITE_DB_FILENAME = 'file:db_academica.sqlite3?vfs=opfs';

class SqliteDb {
    constructor(promiser) {
        this.promiser = promiser;
    }

    async exec(sql, bind = [], options = {}) {
        const response = await this.promiser('exec', {
            sql,
            bind,
            ...options
        });
        return response.result;
    }

    async select(sql, bind = []) {
        const result = await this.exec(sql, bind, {
            rowMode: 'object',
            resultRows: []
        });
        return result.resultRows ?? [];
    }

    async first(sql, bind = []) {
        const rows = await this.select(sql, bind);
        return rows[0] ?? null;
    }

    async scalar(sql, bind = []) {
        const row = await this.first(sql, bind);
        return row ? Object.values(row)[0] : null;
    }
}

function openLegacyIndexedDb(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        let createdDuringProbe = false;

        request.onupgradeneeded = () => {
            createdDuringProbe = true;
            request.transaction.abort();
        };
        request.onsuccess = () => {
            const database = request.result;
            if (createdDuringProbe) {
                database.close();
                indexedDB.deleteDatabase(dbName);
                resolve(null);
                return;
            }
            resolve(database);
        };
        request.onerror = () => {
            if (createdDuringProbe && request.error?.name === 'AbortError') {
                resolve(null);
                return;
            }
            reject(request.error);
        };
        request.onblocked = () => reject(new Error(`No se pudo abrir IndexedDB legado: ${dbName}`));
    });
}

async function upsertAlumno(sqliteDb, alumno) {
    await sqliteDb.exec(
        `INSERT INTO alumnos (idAlumno, codigo, nombre, fechaNacimiento, direccion, telefono, sexo, hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(idAlumno) DO UPDATE SET
            codigo = excluded.codigo,
            nombre = excluded.nombre,
            fechaNacimiento = excluded.fechaNacimiento,
            direccion = excluded.direccion,
            telefono = excluded.telefono,
            sexo = excluded.sexo,
            hash = excluded.hash;`,
        [alumno.idAlumno, alumno.codigo, alumno.nombre, alumno.fechaNacimiento, alumno.direccion, alumno.telefono, alumno.sexo, alumno.hash ?? null]
    );
}

async function upsertMateria(sqliteDb, materia) {
    await sqliteDb.exec(
        `INSERT INTO materias (idMateria, codigo, nombre, uv)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(idMateria) DO UPDATE SET
            codigo = excluded.codigo,
            nombre = excluded.nombre,
            uv = excluded.uv;`,
        [materia.idMateria, materia.codigo, materia.nombre, materia.uv]
    );
}

async function upsertDocente(sqliteDb, docente) {
    await sqliteDb.exec(
        `INSERT INTO docentes (idDocente, codigo, nombre, dui, direccion, email, telefono, escalafon, hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(idDocente) DO UPDATE SET
            codigo = excluded.codigo,
            nombre = excluded.nombre,
            dui = excluded.dui,
            direccion = excluded.direccion,
            email = excluded.email,
            telefono = excluded.telefono,
            escalafon = excluded.escalafon,
            hash = excluded.hash;`,
        [docente.idDocente, docente.codigo, docente.nombre, docente.dui, docente.direccion, docente.email, docente.telefono, docente.escalafon, docente.hash ?? null]
    );
}

async function createSchema(sqliteDb) {
    console.time('createSchema');
    await sqliteDb.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS alumnos (
            idAlumno TEXT PRIMARY KEY,
            codigo TEXT NOT NULL,
            nombre TEXT NOT NULL,
            fechaNacimiento TEXT NOT NULL,
            direccion TEXT NOT NULL,
            telefono TEXT NOT NULL,
            sexo TEXT NOT NULL,
            hash TEXT
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_alumnos_codigo ON alumnos(codigo);

        CREATE TABLE IF NOT EXISTS materias (
            idMateria TEXT PRIMARY KEY,
            codigo TEXT NOT NULL,
            nombre TEXT NOT NULL,
            uv TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_materias_codigo ON materias(codigo);

        CREATE TABLE IF NOT EXISTS docentes (
            idDocente TEXT PRIMARY KEY,
            codigo TEXT NOT NULL,
            nombre TEXT NOT NULL,
            dui TEXT NOT NULL,
            direccion TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT NOT NULL,
            escalafon TEXT NOT NULL,
            hash TEXT
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_docentes_codigo ON docentes(codigo);
    `);
    console.timeEnd('createSchema');
}

async function initSqliteDb() {
    if (!globalThis.sqlite3Worker1Promiser?.v2) {
        throw new Error('No se encontro sqlite3Worker1Promiser.v2.');
    }

    const promiser = await globalThis.sqlite3Worker1Promiser.v2({
        worker: () => new Worker(`${SQLITE_WASM_BASE}/sqlite3-worker1.js`)
    });

    const config = await promiser('config-get', {});
    const vfsList = config.result?.vfsList ?? [];
    if (!vfsList.includes('opfs')) {
        throw new Error('Este navegador no expone el VFS opfs requerido por SQLite WASM.');
    }

    await promiser('open', { filename: SQLITE_DB_FILENAME });

    const sqliteDb = new SqliteDb(promiser);
    await createSchema(sqliteDb);

    return sqliteDb;
}

globalThis.dbReady = initSqliteDb()
    .then((sqliteDb) => {
        globalThis.db = sqliteDb;
        return sqliteDb;
    })
    .catch((error) => {
        console.error('Error inicializando SQLite WASM + OPFS:', error);
        throw error;
    });