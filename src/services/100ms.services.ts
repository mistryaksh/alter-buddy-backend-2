import { SDK } from "@100mslive/server-sdk";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

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
      console.log(callType);
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
      console.log("ROOM ID", roomId);
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
      console.log("100MS", error);
      return error.data.response.message;
    }
  }
}

export const VideoCallService = new VideoCallServices();
