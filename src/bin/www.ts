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

var mentor: string | null = null;
io.on("connection", (socket) => {
  socket.on("GET_CALL_REQUEST", async (data) => {
    const findChat = await Chat.findOne({
      "sessionDetails.roomId": data.room.id,
    });

    if (!findChat) {
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
          callType: data.callType,
          roomId: data.room.id,
          roomName: data.room.name,
          duration: 0,
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
      await new Notification({
        notificationTo: session.users.user,
        notificationBy: session.users.mentor,
        content: session.sessionDetails.description
          ? session.sessionDetails.description
          : "N/A",
        label: session.sessionDetails.roomName,
        notificationFor: "user",
        markAsRead: false,
      }).save();
      io.emit("THROW_CALL_REQUEST", session);
    } else {
      io.emit("THROW_CALL_REQUEST", findChat);
    }
  });

  socket.on("ACCEPT_CALL", async (data) => {
    const chat = await Chat.findOneAndUpdate({
      "sessionDetails.roomCode.mentor": data,
      status: "ONGOING",
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
  socket.on(
    "FINISH_CALL",
    async ({ duration, roomId }: { roomId: string; duration: string }) => {
      const room = await Chat.findOne({ "sessionDetails.roomId": roomId });
      await Chat.findOneAndUpdate(
        {
          "sessionDetails.roomId": roomId,
        },
        {
          $set: {
            status: "COMPLETED",
            "sessionDetails.duration": duration,
          },
        }
      );
    }
  );
  socket.on(
    "CHAT_DATA_TO_MENTOR",
    async ({
      mentorId,
      roomId,
      userId,
    }: {
      mentorId: string;
      roomId: string;
      userId: string;
    }) => {
      await new Chat({
        users: {
          mentor: mentorId,
          user: userId,
        },
        sessionDetails: {
          callType: "chat",
          roomId: roomId,
          roomCode: {
            host: roomId,
            mentor: roomId,
          },
          roomName: `${userId}-${mentorId}`,
        },
        message: [],
        status: "ONGOING",
      }).save();

      if (mentorId?.length && roomId?.length && userId?.length) {
        io.emit("GET_MENTORS_CHAT_DATA", { mentorId, roomId, userId });
      }
    }
  );
  socket.on("CHAT_LEAVE", async ({ chatRoom }: { chatRoom: string }) => {
    await Chat.findOneAndUpdate(
      { "sessionDetails.roomId": chatRoom },
      { $set: { status: "COMPLETED" } }
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
