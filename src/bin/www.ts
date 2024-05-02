import http from "http";
import app from "../index";
import { normalizePort } from "../utils";
import { Server } from "socket.io";
import { Chat, Mentor, User } from "model";
const port = normalizePort(process.env.PORT || 8080);
app.set("port", port);

export const server = http.createServer(app);

const io = new Server(server, {
     cors: {
          origin: "*",
     },
});

io.on("connection", async (socket) => {
     socket.on("connected", () => {});
     socket.on("GET_CALL_REQUEST", async (data) => {
       const { mentorId, roomId, userId, token } = data;

       if (mentorId && roomId && userId && token) {
         socket.join(data.roomId);
         if (token) {
           const chat = await new Chat({
             sessionDetails: {
               roomId: roomId,
               roomToken: token,
             },
             users: {
               mentor: mentorId,
               user: userId,
             },
           }).save();
         } else {
         }
         const mentor = await Mentor.findOne({ _id: mentorId });
         const user = await User.findOne({ _id: userId });
         if (mentor._id.toString() === mentorId) {
           io.emit("THROW_CALL_REQUEST", {
             data,
             user,
             mentor,
           });
         }
       }
     });
     socket.on("CALL_ACTION", async (res: any) => {
       if (res.action === "ACCEPT") {
         socket.join(res.config.roomId);
         await Mentor.findByIdAndUpdate(
           { _id: res.mentor },
           { $set: { inCall: true } }
         );
         socket.to(res.config.roomId).emit("START_CALL", res.config.roomId);
       }
       if (res.action === "REJECT") {
         socket.broadcast.emit("ON_REJECTED", "REJECTED");
       }
     });

     socket.on("CALL_END", async (res) => {
       const { userId, mentorId, messages, roomId } = res;
       await Mentor.findByIdAndUpdate(
         { _id: mentorId },
         { $set: { inCall: false } }
       );
       const chat = await Chat.findOneAndUpdate(
         { "sessionDetails.roomId": roomId as string },
         {
           $set: {
             status: "COMPLETED",
           },
         }
       );
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
