var http = require('http').Server(),
    io = require('socket.io')(http);

io.on('connect', (socket) => {
    console.log('Un usuario se ha conectado');
});

http.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});