import { SDK } from "@100mslive/server-sdk";
import dotenv from "dotenv";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

dotenv.config();

class VideoCallServices {
  sdk: SDK = new SDK(
    process.env.REACT_APP_100ms_SDK_KEY!,
    process.env.REACT_APP_100ms_SDK_SECRET!
  );
  msToken: string = "";
  public async generateJwtToken() {
    var payload = {
      access_key: "664cb3714286645c6d24c97a",
      type: "management",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    const createToken = jwt.sign(
      payload,
      "KRmG-tHyGjU6FKqANwdDHpBIiF8mSBEJLt0A461leWY4KdR5MJTmr6XIXtjqm68b_ijgE_iRosIjzMgtEVk7l4lTeq0bqSQkCaBKPXLHDMRs2Zfb3jPk2-LDr_4XocFJy8DMZSJBWpWPgvpdyODOhluqOFJXUgkrjYqDg-NoxDg=",
      {
        algorithm: "HS256",
        expiresIn: "24h",
        jwtid: uuidv4(),
      }
    );
    return createToken;
  }
  public async Create100MSRoom({
    roomName,
    roomDesc,
    callType,
  }: {
    roomName: string;
    roomDesc: string;
    callType: string;
  }) {
    try {
      const token = await this.generateJwtToken();
      this.msToken = token;
      const room = await axios.post(
        `https://api.100ms.live/v2/rooms`,
        {
          name: roomName,
          description: roomDesc,
          template_id: callType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.msToken}`,
          },
        }
      );
      return await room.data;
    } catch (error) {
      throw error.response;
    }
  }

  token: string;
  public async Create100MSRoomCode({ roomId }: { roomId: string }) {
    try {
      const room = await axios.post(
        `https://api.100ms.live/v2/room-codes/room/${roomId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.msToken}`,
          },
        }
      );
      return await room.data;
    } catch (error) {
      return error.data.response.message;
    }
  }
}

export const VideoCallService = new VideoCallServices();
