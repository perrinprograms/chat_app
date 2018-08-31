const express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

var usernames = [];



app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function (socket) {

    socket.on('join', function (name) {
        socket.name = name;
        usernames.push(socket.name);
        io.emit('join', socket.name);
    });

    socket.on('chat message', function (data) {
        io.emit('chat message', {
            msg: data,
            name: socket.name
        });
    });
    socket.on('disconnect', function (data) {
        io.emit('leave', {
            name: socket.name
        });
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
})