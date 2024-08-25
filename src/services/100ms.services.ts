import { SDK } from "@100mslive/server-sdk";
import { callType } from "interface/chat.interface";
import dotenv from "dotenv";
import { CreateParams } from "@100mslive/server-sdk/dist/types/types/api_types/room";
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
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjQ1MTIyNDUsImV4cCI6MTcyNTExNzA0NSwianRpIjoiOWNjM2UyMTItZTZlOC00OGRlLWIwZmEtMmJmMTVhNjg0Yzk3IiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MjQ1MTIyNDUsImFjY2Vzc19rZXkiOiI2NjRjYjM3MTQyODY2NDVjNmQyNGM5N2EifQ.KrRjJSWm5_CI3l9v0n19ETXvxwM_eZWBjK-lHH6rRgY",
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
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjQ1MTIyNDUsImV4cCI6MTcyNTExNzA0NSwianRpIjoiOWNjM2UyMTItZTZlOC00OGRlLWIwZmEtMmJmMTVhNjg0Yzk3IiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MjQ1MTIyNDUsImFjY2Vzc19rZXkiOiI2NjRjYjM3MTQyODY2NDVjNmQyNGM5N2EifQ.KrRjJSWm5_CI3l9v0n19ETXvxwM_eZWBjK-lHH6rRgY",
          },
        }
      );
      return await room.data;
    } catch (error) {
      throw error.data.response.message;
    }
  }
}

export const VideoCallService = new VideoCallServices();
