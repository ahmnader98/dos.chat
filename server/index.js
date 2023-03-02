const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, getUser, removeUser, getUsersInRoom } = require("./users");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 3333;
const router = require("./router");
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "https://dos-chat.vercel.app/" },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (!name) return;

    socket.emit("message", {
      user: "admin",
      text: `${user.name} joined room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} joined!` });

    socket.join(user.room);
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user[0]) {
      io.to(user[0].room).emit("message", {
        user: "admin",
        text: `${user[0].name} left.`,
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
