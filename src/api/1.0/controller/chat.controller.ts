import { Request, Response } from "express";
import { IControllerRoutes, IController } from "interface";
import { ChatService } from "services/chat.service";
import { Ok, UnAuthorized } from "utils";

export class ChatController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      path: "/chat/get-token/:userId",
      handler: this.getAgoraToken,
      method: "GET",
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
      console.log(err);
      return UnAuthorized(res, err);
    }
  }
}
