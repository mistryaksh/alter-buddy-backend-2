import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { AuthForMentor } from "middleware";
import { Chat } from "model";
import { ChatService } from "services/chat.service";
import { getTokenFromHeader, Ok, UnAuthorized, verifyToken } from "utils";

export class ChatController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      path: "/chat/get-token/:userId",
      handler: this.getAgoraToken,
      method: "GET",
    });
    this.routes.push({
      handler: this.getMyChatsMentor,
      method: "GET",
      path: "/mentor/my-chats",
      middleware: [AuthForMentor],
    });
    this.routes.push({
      handler: this.SaveChat,
      method: "PUT",
      path: "/mentor/save-chat",
    });
  }
  public async getAgoraToken(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return UnAuthorized(res, "user not found");
      }
      const token = await ChatService.useAgoraToken(userId);
      return Ok(res, token);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async getMyChatsMentor(req: Request, res: Response) {
    try {
      const mentorToken = getTokenFromHeader(req);
      const verify = verifyToken(mentorToken);
      const chat = await Chat.find({
        "users.mentor": verify.id,
        "sessionDetails.callType": "chat",
      }).populate("users.user");
      return Ok(res, chat);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async SaveChat(req: Request, res: Response) {
    try {
      const { message, chatId } = req.body;
      console.log(req.body.message);
      const chat = await Chat.findOneAndUpdate(
        { "sessionDetails.roomId": req.body.chatId },
        { $push: { message: req.body.message } }
      );
      console.log(chat);
      return Ok(res, `chat has been saved`);
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }
}
