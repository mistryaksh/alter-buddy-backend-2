import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AuthForMentor, AuthForUser } from "middleware";
import { Chat } from "model";
import { Ok, UnAuthorized, getTokenFromHeader, verifyToken } from "utils";

export class SessionController implements IController {
     public routes: IControllerRoutes[] = [];

     constructor() {
          this.routes.push({
               path: "/chat/room-details/:roomId",
               handler: this.GetChatWithRoomId,
               method: "GET",
          });
          this.routes.push({
               handler: this.GetMentorMyCalls,
               method: "GET",
               path: "/mentor/calls",
               middleware: [AuthForMentor],
          });
          this.routes.push({
               handler: this.GetUserMyCalls,
               method: "GET",
               path: "/user/calls",
               middleware: [AuthForUser],
          });
     }
     public async GetChatWithRoomId(req: Request, res: Response) {
          try {
               const { roomId } = req.params;
               const chat = await Chat.findOne({ "sessionDetails.roomId": roomId });
               return Ok(res, chat);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async GetMentorMyCalls(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const verified = verifyToken(token);
               const chat = await Chat.find({ "users.mentor": verified.id })
                    .populate({
                         path: "users.user",
                         model: "User",
                         select: "name email mobile",
                    })
                    .populate({
                         path: "users.mentor",
                         model: "Mentor",
                         select: "name contact subCategory specialists category",
                         populate: ["subCategory", "category"],
                    })
                    .sort({ createdAt: -1 });
               return Ok(res, chat);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async GetUserMyCalls(req: Request, res: Response) {
          try {
               const token = getTokenFromHeader(req);
               const verified = verifyToken(token);
               const chat = await Chat.find({ "users.user": verified.id })
                    .populate({
                         path: "users.user",
                         model: "User",
                    })
                    .populate({
                         path: "users.mentor",
                         model: "Mentor",
                    });

               return Ok(res, chat);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
}
