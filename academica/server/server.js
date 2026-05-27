var fs = require('fs'),
    http = require('http').Server((req, res) => {
        if (req.url === '/') {
            fs.readFile(__dirname + '/index.html', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error cargando index.html');
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    }),
    io = require('socket.io')(http, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }),
    { MongoClient, ObjectId } = require('mongodb'),
    url = 'mongodb://127.0.0.1:27017',
    client = new MongoClient(url),
    dbname = 'chats_ugb';

const crypto = require('crypto');
global.crypto = crypto.webcrypto;

// Prevenir que el servidor crashee por errores no manejados (ej. Base de datos caída)
process.on('unhandledRejection', (reason, promise) => {
    console.log('Fallo de conexión en promesas de fondo (posiblemente MongoDB apagado):', reason.message);
});
process.on('uncaughtException', (err) => {
    console.error('Fallo crítico evitado:', err.message);
});

async function conectarMongo() {
    await client.connect();
    return client.db(dbname);
}

io.on('connect', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('mensajeRecibido', async (data) => {
        try {
            let db = await conectarMongo(),
                collection = db.collection('chats');
            
            let result = await collection.insertOne({ 
                user: data.titulo, 
                mensaje: data.mensaje, 
                fecha: new Date() 
            });
            console.log('Mensaje guardado en MongoDB con id:', result.insertedId);
        } catch (error) {
            console.error('Error guardando en MongoDB:', error);
        }
        
        io.emit('mensajeEnviar', data);
    });
});

http.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});