import http from "http";
import app from "../index";
import { normalizePort } from "../utils";
import { Server } from "socket.io";
import { Chat, Notification } from "model";
import { IChatProps } from "interface/chat.interface";
import mongoose from "mongoose";

const port = normalizePort(process.env.PORT || 8080);
app.set("port", port);

export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("connected", () => {
    console.log("client connected");
  });

  // User hit the request to the mentor
  socket.on("rantData", (data: { roomId: string }) => {
    console.log(data);

    // Mentor receive channel id
    io.emit("rantDataTransfer", data);
  });

  socket.on("disconnected", () => {
    socket.disconnect();
  });
});

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.info(`server enabled on ${bind}`);
};

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
