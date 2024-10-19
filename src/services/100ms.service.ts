import { SDK, Room } from "@100mslive/server-sdk";
import { v4 as uuid } from "uuid";

class HMSServices {
     hms: SDK;
     constructor() {
          this.hms = new SDK(
               "664cb3714286645c6d24c97a",
               "KRmG-tHyGjU6FKqANwdDHpBIiF8mSBEJLt0A461leWY4KdR5MJTmr6XIXtjqm68b_ijgE_iRosIjzMgtEVk7l4lTeq0bqSQkCaBKPXLHDMRs2Zfb3jPk2-LDr_4XocFJy8DMZSJBWpWPgvpdyODOhluqOFJXUgkrjYqDg-NoxDg="
          );
     }

     public getRoomConfigs = async () => {
          const roomOptions: Room.CreateParams = {
               description: "test room 2",
               name: uuid(),
               recording_info: {
                    enabled: false,
               },
               region: "in",
               template_id: "664cb37b5afd7e4281e3192a",
          };
          const roomId = await this.hms.rooms.create(roomOptions);
          const roomCode = await this.hms.roomCodes.create(roomId.id);
          return roomCode;
     };
}

export const HMSService = new HMSServices();
