import mongoose from "mongoose";

export interface IChatProps {
     users: {
          user: mongoose.Schema.Types.ObjectId;
          mentor: mongoose.Schema.Types.ObjectId;
     };
     sessionDetails: {
          roomId: string;
          roomToken: string;
     };
     message: [
          {
               messageId: mongoose.Schema.Types.String;
               message: mongoose.Schema.Types.String;
               senderId: mongoose.Schema.Types.String;
               senderName: mongoose.Schema.Types.String;
               timestamp: mongoose.Schema.Types.String;
               topic: mongoose.Schema.Types.String;
          }
     ];
     status?: callType;
}
export type callType = "REJECTED" | "ONGOING" | "COMPLETED" | "PENDING" | "ACCEPTED";
