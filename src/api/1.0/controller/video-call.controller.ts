import { Request, Response } from "express";
import { IRouter } from "express";
import { IController, IControllerRoutes } from "interface";
import { BadRequest, Ok, UnAuthorized } from "utils";
import jwt from "jsonwebtoken";
import { VideoSdkService } from "services/video-sdk.service";
import config from "config";

export class VideoCallController implements IController {
     public routes: IControllerRoutes[] = [];
     constructor() {
          this.routes.push({
               handler: this.GenerateVideoCallToken,
               method: "GET",
               path: "/video-call-token",
          });
          this.routes.push({
               handler: this.CreateMeeting,
               method: "GET",
               path: "/create-meeting",
          });
          this.routes.push({
               handler: this.ValidateRoomId,
               method: "POST",
               path: "/validate-room",
          });
     }

     public async GenerateVideoCallToken(req: Request, res: Response) {
          try {
               const payload = {
                    apikey: config.get("REACT_APP_VIDEO_SDK_KEY"),
                    permissions: [`allow_join`], // `ask_join` || `allow_mod`
               };

               const token = jwt.sign(payload, config.get("REACT_APP_VIDEO_SDK_SECRET"), {
                    expiresIn: "120m",
                    algorithm: "HS256",
               });
               return Ok(res, token);
          } catch (err) {
               return UnAuthorized(res, err);
          }
     }
     public async CreateMeeting(req: Request, res: Response) {
          try {
               const payload = {
                    apikey: config.get("REACT_APP_VIDEO_SDK_KEY"),
                    permissions: [`allow_join`], // `ask_join` || `allow_mod`
               };

               const token = jwt.sign(payload, config.get("REACT_APP_VIDEO_SDK_SECRET"), {
                    expiresIn: "120m",
                    algorithm: "HS256",
               });

               if (!token) {
                    return Ok(res, "token is not provided");
               }
               const videoSdkService = await VideoSdkService.CreateMeeting(token);
               return Ok(res, {
                    meetingId: videoSdkService.data.roomId,
                    token,
               });
          } catch (err) {
               console.log("ERROR", err);
               return UnAuthorized(res, err);
          }
     }
     public async ValidateRoomId(req: Request, res: Response) {
          try {
               const { roomId, token } = req.body;
               if (!roomId || !token) {
                    return BadRequest(res, "failed to validate! not room id or token is provided");
               }
               const videoSdkService = await VideoSdkService.ValidateRoom({ roomId, token });
               return Ok(res, await videoSdkService.data);
          } catch (err) {
               if (err.response) {
                    console.log("AXIOS ERROR", err.response.data.message);
                    return UnAuthorized(res, err.response.data.message);
               }
               console.log("NORMAL ERROR", err);
               return UnAuthorized(res, err);
          }
     }
}
