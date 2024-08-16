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

// When a client connects
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Listen for chat request from the first app
  socket.on('requestChat', (data) => {
    console.log('Chat requested:', data);

    // Emit chat request to the second app
    socket.broadcast.emit('receiveChatRequest', data);
  });

  // Listen for chat acceptance from the second app
  socket.on('acceptChat', (data, callback) => {
    console.log('Chat accepted:', data);

    // Notify the first app that the chat has been accepted
    socket.broadcast.emit('chatAccepted', data);

    // Call the callback to acknowledge
    if (callback) callback();
  });

  // Handle leaving the chat
  socket.on('leaveChat', (data, callback) => {
    console.log('Chat left:', data);

    // Notify the other app that the chat was left
    socket.broadcast.emit('chatLeft', data);

    // Acknowledge the event to the client
    if (callback) callback();
  });

  // When the client disconnects
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
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
