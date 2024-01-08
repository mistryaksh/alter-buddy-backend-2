import axios from "axios";

class VideoSdkServices {
     public async CreateMeeting(token: string) {
          return await axios.post(
               `https://api.videosdk.live/v2/rooms`,
               {},
               {
                    headers: {
                         authorization: `${token}`,
                         "Content-Type": "application/json",
                    },
               }
          );
     }
     public async ValidateRoom({ roomId, token }: { roomId: string; token: string }) {
          return await axios.get(`https://api.videosdk.live/v2/rooms/validate/${roomId}`, {
               headers: {
                    authorization: `${token}`,
                    "Content-Type": "application/json",
               },
          });
     }
}

export const VideoSdkService = new VideoSdkServices();
