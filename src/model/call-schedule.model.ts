import { IMentorCallScheduleProps } from "interface";
import mongoose from "mongoose";

const CallScheduleSchema = new mongoose.Schema<IMentorCallScheduleProps>(
     {
          mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
          slotsDate: { type: mongoose.Schema.Types.String, required: true, default: new Date().toISOString() },
          slots: [
               {
                    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
                    time: { type: mongoose.Schema.Types.String },
                    booked: { type: mongoose.Schema.Types.Boolean, default: false },
                    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
               },
          ],
     },
     {
          timestamps: true,
     }
);

export const CallSchedule = mongoose.model<IMentorCallScheduleProps>("CallSchedule", CallScheduleSchema);
