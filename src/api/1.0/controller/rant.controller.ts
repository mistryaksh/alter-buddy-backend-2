import { Request, Response } from "express";

import { IController, IControllerRoutes } from "interface";
import { getTokenFromHeader, Ok, UnAuthorized, verifyToken } from "utils";
import config from "config";
import Ably from "ably";
import { User } from "model";

export class RantController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      handler: this.GetRantToken,
      method: "GET",
      path: "/rant/token",
    });
  }

  public async GetRantToken(req: Request, res: Response) {
    try {
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const user = await User.findOne({ _id: verified.id });
      const ably = new Ably.Realtime({
        key: "LrjjGQ.DPg-_Q:wmhnpNyD3kIbv-caW_glCxDlyIYwlT6pYQJTE4EJdCw",
      });
      const ablyToken = await ably.auth.createTokenRequest({
        clientId: user._id as unknown as string,
      });
      return Ok(res, ablyToken);
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }
}
