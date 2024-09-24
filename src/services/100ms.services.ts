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
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjcxNjA0NTgsImV4cCI6MTcyNzc2NTI1OCwianRpIjoiNzBjZTg3YzctYjY1ZS00MDljLTlmYTEtZTIwM2QyOGNhZTMzIiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MjcxNjA0NTgsImFjY2Vzc19rZXkiOiI2NjRjYjM3MTQyODY2NDVjNmQyNGM5N2EifQ.iGez04sFMC5nfCOrFLvRdJP9hJR3MRDRQsQwsgxPWdM",
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
            Authorization:
              `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjcxNjA0NTgsImV4cCI6MTcyNzc2NTI1OCwianRpIjoiNzBjZTg3YzctYjY1ZS00MDljLTlmYTEtZTIwM2QyOGNhZTMzIiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MjcxNjA0NTgsImFjY2Vzc19rZXkiOiI2NjRjYjM3MTQyODY2NDVjNmQyNGM5N2EifQ.iGez04sFMC5nfCOrFLvRdJP9hJR3MRDRQsQwsgxPWdM` as string,
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
