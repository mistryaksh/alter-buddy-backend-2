import { SDK } from "@100mslive/server-sdk";
import dotenv from "dotenv";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuid4 } from "uuid";

dotenv.config();

function generateJwtToken(
  appAccessKey: string,
  appSecret: string,
  roomId: string,
  userId: string,
  role: string,
  expiresIn: string = "24h"
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const payload: JwtPayload = {
      access_key: appAccessKey,
      room_id: roomId,
      user_id: userId,
      role: role,
      type: "app",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    jwt.sign(
      payload,
      appSecret,
      {
        algorithm: "HS256",
        expiresIn: expiresIn,
        jwtid: uuid4(),
      },
      (err: Error | null, token?: string) => {
        if (err) {
          console.error("Error generating token:", err);
          return reject(err);
        }
        resolve(token || null);
      }
    );
  });
}

class VideoCallServices {
  sdk: SDK = new SDK(
    process.env.REACT_APP_100ms_SDK_KEY!,
    process.env.REACT_APP_100ms_SDK_SECRET!
  );

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
            Authorization: `Bearer ${process.env.REACT_APP_100MD_SDK_TOKEN}`,
          },
        }
      );
      return await room.data;
    } catch (error) {
      throw error.response;
    }
  }

  public async Create100MSRoomCode({ roomId }: { roomId: string }) {
    try {
      const room = await axios.post(
        `https://api.100ms.live/v2/room-codes/room/${roomId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_100MD_SDK_TOKEN}`,
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
