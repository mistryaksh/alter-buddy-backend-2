import { RtmRole, RtmTokenBuilder } from "agora-access-token";
import config from "config";

const appId: string = config.get("AGORA_APP_ID");
const appCertificate: string =
  config.get("AGORA_CERTIFICATE") || "0e8135fff15c47438995c1ab28ab8153";

class ChatServices {
  public async useAgoraToken(userId: string) {
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    const token = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      userId as string,
      RtmRole.Rtm_User,
      privilegeExpiredTs
    );
    return token;
  }
}

export const ChatService = new ChatServices();
