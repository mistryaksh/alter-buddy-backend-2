import { Request, Response } from "express";
import { IController, IControllerRoutes } from "interface";
import { SDK, Room } from "@100mslive/server-sdk";
import { Ok, UnAuthorized } from "utils";
import { configDotenv } from "dotenv";

configDotenv();

export class CallController implements IController {
  public routes: IControllerRoutes[] = [];
  hms: SDK;

  constructor() {
    this.hms = new SDK(
      "664cb3714286645c6d24c97a",
      "KRmG-tHyGjU6FKqANwdDHpBIiF8mSBEJLt0A461leWY4KdR5MJTmr6XIXtjqm68b_ijgE_iRosIjzMgtEVk7l4lTeq0bqSQkCaBKPXLHDMRs2Zfb3jPk2-LDr_4XocFJy8DMZSJBWpWPgvpdyODOhluqOFJXUgkrjYqDg-NoxDg="
    );

    // Define routes with 'this' binding
    this.routes.push({
      handler: this.createRoom.bind(this), // Bind 'this' to ensure correct context
      method: "GET",
      path: "/create-room",
    });
  }

  public async createRoom(req: Request, res: Response) {
    try {
      const roomOptions: Room.CreateParams = {
        description: "test room",
        name: "test room",
        recording_info: {
          enabled: false,
        },
        region: "in",
        template_id: "664cb37b5afd7e4281e3192a",
      };
      const roomWithOptions = await this.hms.rooms.create(roomOptions);
      return Ok(res, roomWithOptions);
    } catch (err) {
      console.log(err);
      return UnAuthorized(res, err);
    }
  }
}
