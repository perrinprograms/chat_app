const express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var usernames = [];

app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://192.168.16.119:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.sendFile(__dirname + "/chat.html");
});

io.on("connection", function (socket) {
  socket.on("join", function (name) {
    socket.name = name;
    usernames.push(socket.name);
    io.emit("join", socket.name);
  });

  socket.on("user typing", function (isUserTyping) {
    socket.typing = isUserTyping;
    io.emit("user typing", {
      name: socket.name,
      typing: socket.typing
    });
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", {
      msg: data,
      name: socket.name
    });
  });

  socket.on("disconnect", function (data) {
    io.emit("leave", {
      name: socket.name
    });
  });
});

http.listen(3000, function () {
  console.log("listening on *:3000");
});