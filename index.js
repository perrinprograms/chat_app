'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var app = express();
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'chat.html');

const server = express()
  .use(express.static(__dirname), (req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));



const io = socketIO(server);

var usernames = [];
var PeopleTyping = [];



/* app.get("/", function (req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.sendFile(__dirname + "/chat.html");
}); */



io.on("connection", function (socket) {

  socket.on("join", function (name) {
    socket.name = name;
    usernames.push(socket.name);
    io.emit("join", socket.name);
  });

  socket.on("user typing", function (isUserTyping) {

    socket.typing = isUserTyping;

    if (socket.typing && !PeopleTyping.includes(socket.name)) {
      PeopleTyping.push(socket.name)
    } else if (!socket.typing) {
      PeopleTyping.splice(PeopleTyping.indexOf(socket.name), 1);
    }

    io.emit("user typing", {
      names: PeopleTyping,
      typing: socket.typing,
      name: socket.name
    });
  });

  socket.on("chat message", function (message) {
    var sanitizeHtml = require('sanitize-html');
    var clean = sanitizeHtml(message);
    io.emit("chat message", {
      msg: clean,
      name: socket.name
    });
  });

  socket.on("disconnect", function (data) {
    if (PeopleTyping.includes(socket.name)) //if someone is typing while they disconnect, it won't keep them in the array
      PeopleTyping.splice(PeopleTyping.indexOf(socket.name), 1);
    io.emit("leave", {
      name: socket.name
    });
  });
});