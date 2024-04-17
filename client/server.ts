import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";
import { addUser, getUser, removeUser } from "./users";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket: Socket) => {
    socket.on(
      "join",
      ({ name, room }: { name: string; room: string }, callback: Function) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (!name) return;
        if (!user) return;
        socket.emit("message", {
          user: "admin",
          text: `${user.name} joined room ${user.room}`,
        });

        socket.broadcast
          .to(user.room)
          .emit("message", { user: "admin", text: `${user.name} joined!` });

        socket.join(user.room);
      }
    );

    socket.on("sendMessage", (message: string, callback: Function) => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit("message", { user: user.name, text: message });
        callback();
      }
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      if (user) {
        io.to(user.room).emit("message", {
          user: "admin",
          text: `${user.name} left.`,
        });
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
