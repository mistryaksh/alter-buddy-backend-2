import axios from "axios";

class LiveStreamServices {
     public async StartLiveStream(token: string) {
          return await axios.post(
               `https://api.videosdk.live/v2/hls/start`,
               {
                    roomId: "xyz",
                    templateUrl:
                         "https://www.example.com/?token=tooken&meetingId=74v5-v21l-n1ey&participantId=RECORDER_ID",
                    config: "configObj",
               },
               {
                    headers: {
                         Authorization: token,
                         "Content-Type": "application/json",
                    },
               }
          );
     }
}

export const LiveStreamService = new LiveStreamServices();
