import { Request, Response } from "express";

import { IController, IControllerRoutes } from "interface";
import { getTokenFromHeader, Ok, UnAuthorized, verifyToken } from "utils";
import Ably from "ably";
import { User } from "model";
import { StreamClient } from "@stream-io/node-sdk";

export class RantController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      handler: this.GetAblyToken,
      method: "GET",
      path: "/rant/ably/token",
    });
    this.routes.push({
      handler: this.GetStreamToken,
      method: "GET",
      path: "/rant/get-stream/token",
    });
  }

  public async GetAblyToken(req: Request, res: Response) {
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
      return UnAuthorized(res, err);
    }
  }

  public async GetStreamToken(req: Request, res: Response) {
    try {
      const client = new StreamClient(
        "n9y75xde4yk4",
        "2u4etpbwhrgb8kmffgt879pgknmdndzxs82hptqtxndt39ku3shc6yavpup2us8e"
      );
      const token = getTokenFromHeader(req);
      const verified = verifyToken(token);
      const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;

      const streamToken = client.createToken(verified.id, exp);
      return Ok(res, streamToken);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
