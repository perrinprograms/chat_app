"use strict";

const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const PORT = process.env.PORT || 49153;
const INDEX = path.join(__dirname, "chat.html");

const server = express()
  .use(express.static(__dirname), (req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

var usernames = [];
var PeopleTyping = [];

//when someone is typing it will hit this point in the server. 
io.on("connection", function (socket) {
  socket.on("join", function (name) {
    socket.name = name;
    //pushing the usernames to an array 
    //TODO: if the username exists, they must choose a new name. 
    usernames.push(socket.name);
    io.emit("join", socket.name);
  });

  //when someone is typing, it will hit this point in the server
  socket.on("user typing", function (isUserTyping) {
    socket.typing = isUserTyping;

    if (socket.typing && !PeopleTyping.includes(socket.name)) {
      PeopleTyping.push(socket.name);
    } else if (!socket.typing) {
      PeopleTyping.splice(PeopleTyping.indexOf(socket.name), 1);
    }
    //send an array of all who are typing to client
    io.emit("user typing", {
      names: PeopleTyping,
      typing: socket.typing,
      name: socket.name
    });
  });

  //when a chat message is sent on the front end, it will come here
  socket.on("chat message", function (message) {
    //sanitizing the messages which are sent 
    var sanitizeHtml = require("sanitize-html");
    var clean_message = sanitizeHtml(message); {
      io.emit("chat message", {
        msg: clean_message,
        name: socket.name
      });
    }
  });

  socket.on("disconnect", function (data) {
    if (PeopleTyping.includes(socket.name))
      //if someone is typing while they disconnect, it won't keep them in the array
      PeopleTyping.splice(PeopleTyping.indexOf(socket.name), 1);
    io.emit("leave", {
      name: socket.name
    });
  });
});