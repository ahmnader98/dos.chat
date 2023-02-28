const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 3333;
const router = require("./router");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("We have a new connection!");

  socket.on("disconnect", () => {
    console.log("User has disconnected");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));