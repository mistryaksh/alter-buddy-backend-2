import mongoose from "mongoose";
import { IUserProps } from "./user.interface";

export interface IMentorCallScheduleProps {
     callType: ICallType;
     mentorId: mongoose.Schema.Types.ObjectId;
     slots: ISlotProps[];
     slotsDate: string;
}

export interface ISlotProps {
     _id?: string;
     note?: string;
     time: string;
     booked: boolean;
     userId?: mongoose.Schema.Types.ObjectId;
     status: ISlotStatus;
}

enum ISlotStatus {
     ACCEPTED = "accepted",
     REJECTED = "rejected",
}

type ICallType = "chat" | "video" | "audio";
