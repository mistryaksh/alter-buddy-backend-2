import { Request, Response } from "express";
import { IController, IControllerRoutes } from "interface";
import { Ok, UnAuthorized } from "utils";
import { VideoCallService } from "services/100ms.services";
import { AuthForUser } from "middleware";
import { Chat } from "model";
import { callType } from "interface/chat.interface";

export class VideoCallController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      handler: this.SetUpMeeting,
      method: "POST",
      path: "/start-meeting",
      middleware: [AuthForUser],
    });
    this.routes.push({
      handler: this.GetSessionByRoomCode,
      method: "GET",
      path: "/get-session/:roomCode",
    });
  }

  public async SetUpMeeting(req: Request, res: Response) {
    try {
      const { audioCall }: { audioCall: callType } = req.body;

      if (!audioCall) {
        return UnAuthorized(res, "define audio or video call");
      }
      const room = await VideoCallService.Create100MSRoom({
        roomDesc: "This is a sample description for the room",
        roomName: `new-room-1662723668`,
        callType:
          audioCall === "audio"
            ? process.env.REACT_APP_100MD_SDK_AUDIO_TEMPLATE
            : process.env.REACT_APP_100MD_SDK_VIDEO_TEMPLATE,
      });
      if (room.id) {
        const roomCode = await VideoCallService.Create100MSRoomCode({
          roomId: room.id,
        });
        return Ok(res, {
          room: room,
          mentorCode: roomCode.data.find((prop: any) => prop.role === "mentor"),
          userCode: roomCode.data.find((prop: any) => prop.role === "host"),
        });
      } else {
        return UnAuthorized(res, "something went wrong");
      }
    } catch (err) {
      if (err.data) {
        return UnAuthorized(res, err.data.message);
      } else {
        return UnAuthorized(res, err);
      }
    }
  }

  public async GetSessionByRoomCode(req: Request, res: Response) {
    try {
      const session = await Chat.findOne({
        "sessionDetails.roomCode.mentor": req.params.roomCode,
      })
        .populate("users.user")
        .populate("users.mentor");
      return Ok(res, session);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
