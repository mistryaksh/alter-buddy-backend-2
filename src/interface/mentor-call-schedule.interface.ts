import mongoose from "mongoose";
import { IUserProps } from "./user.interface";

export interface IMentorCallScheduleProps {
     mentorId: mongoose.Schema.Types.ObjectId;
     slots: ISlotProps[];
     slotsDate: string;
}

export interface ISlotProps {
     _id?: string;
     time: string;
     booked: boolean;
     userId?: mongoose.Schema.Types.ObjectId;
}
