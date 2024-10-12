import http from "http";
import app from "../index";
import { normalizePort } from "../utils";
import { Server } from "socket.io";
import { Chat, Notification } from "model";
import { IChatProps } from "interface/chat.interface";
import mongoose from "mongoose";

const port = normalizePort(8080);
app.set("port", port);

export const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ! ABLY When a client connects
io.on("connection", (socket) => {
  // Listen for chat request from the first app
  socket.on("requestChat", (data) => {
    // Emit chat request to the second app
    socket.broadcast.emit("receiveChatRequest", data);
  });

  // Listen for chat acceptance from the second app
  socket.on("acceptChat", (data, callback) => {
    // Notify the first app that the chat has been accepted
    socket.broadcast.emit("chatAccepted", data);

    // Call the callback to acknowledge
    if (callback) callback();
  });

  // Handle leaving the chat
  socket.on("leaveChat", (data, callback) => {
    // Notify the other app that the chat was left
    socket.broadcast.emit("chatLeft", data);

    // Acknowledge the event to the client
    if (callback) callback();
  });

  // When the client disconnects
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});
// !100MS
io.on("connection", (socket) => {
  socket.on("GET_CALL_REQUEST", async (data) => {
    const session = await new Chat({
      message: [],
      users: {
        user: data.userId,
        mentor: data.mentorId,
      },
      sessionDetails: {
        description: data.room.description,
        roomCode: {
          host: data.userRoomCode.code,
          mentor: data.mentorRoomCode.code,
        },
        callType: data.callType ? "audio" : "video",
        roomId: data.room.id,
        roomName: data.room.name,
      },
      status: "PENDING",
    }).save();
    await new Notification({
      notificationTo: session.users.mentor,
      notificationBy: session.users.user,
      content: session.sessionDetails.description
        ? session.sessionDetails.description
        : "N/A",
      label: session.sessionDetails.roomName,
      notificationFor: "mentor",
      markAsRead: false,
    }).save();
    io.emit("THROW_CALL_REQUEST", session);
  });

  socket.on("ACCEPT_CALL", async (data) => {
    const chat = await Chat.findOneAndUpdate({
      "sessionDetails.roomCode.mentor": data,
      status: "COMPLETED",
    });
    await Notification.findOneAndUpdate(
      { notificationTo: chat.users.mentor },
      { $set: { markAsRead: true } }
    );
  });

  socket.on("DECLINE_CALL", async (data) => {
    const chat = await Chat.findOneAndUpdate({
      "sessionDetails.roomCode.mentor": data,
      status: "REJECTED",
    });
    await Notification.findOneAndUpdate(
      { notificationTo: chat.users.mentor },
      { $set: { markAsRead: true } }
    );
  });
  socket.on("disconnect", () => {
    console.log("CLIENT DISCONNECTED");
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
