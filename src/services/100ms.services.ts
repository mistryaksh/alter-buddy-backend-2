import config from "config";
import { SDK } from "@100mslive/server-sdk";

class VideoCallServices {
  sdk: SDK = new SDK(
    config.get("REACT_APP_100ms_SDK_KEY"),
    config.get("REACT_APP_100ms_SDK_SECRET")
  );

  public async Create100MSRoom({
    roomName,
    roomDesc,
  }: {
    roomName: string;
    roomDesc: string;
  }) {
    const room = await this.sdk.rooms.create({
      name: roomName,
      description: roomDesc,
      template_id: config.get("REACT_APP_100MD_SDK_TEMPLATE"),
      region: "in",
      recording_info: { enabled: true },
    });
    return room;
  }

  public async Create100MSRoomCode({ roomId }: { roomId: string }) {
    const roomCode = await this.sdk.roomCodes.create(roomId);
    return roomCode;
  }
}

export const VideoCallService = new VideoCallServices();
