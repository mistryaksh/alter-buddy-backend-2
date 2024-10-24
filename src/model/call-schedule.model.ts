import { IMentorCallScheduleProps } from "interface";
import mongoose from "mongoose";

const CallScheduleSchema = new mongoose.Schema<IMentorCallScheduleProps>(
     {
          mentorCode: { type: mongoose.Schema.Types.String,  },
          userCode: { type: mongoose.Schema.Types.String, },
          callType: { type: mongoose.Schema.Types.String },
          mentorId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Mentor",
               required: true,
          },
          slotsDate: {
               type: mongoose.Schema.Types.String,
               required: true,
          },
          slots: [
               {
                    time: { type: mongoose.Schema.Types.String },
                    booked: {
                         type: mongoose.Schema.Types.Boolean,
                         default: false,
                    },
                    userId: {
                         type: mongoose.Schema.Types.ObjectId,
                         ref: "User",
                    },
                    status: {
                         type: mongoose.Schema.Types.String,
                         enum: ["accepted", "rejected"],
                    },
                    note: { type: mongoose.Schema.Types.String },
               },
          ],
     },
     {
          timestamps: true,
     }
);

export const CallSchedule = mongoose.model<IMentorCallScheduleProps>(
     "CallSchedule",
     CallScheduleSchema
);
