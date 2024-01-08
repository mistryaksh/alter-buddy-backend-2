import { IMentorProps } from "interface";
import mongoose from "mongoose";

const MentorSchema = new mongoose.Schema<IMentorProps>(
     {
          auth: {
               username: { type: mongoose.Schema.Types.String, required: true },
               password: { type: mongoose.Schema.Types.String, required: true },
          },
          category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Category" },
          contact: {
               email: { type: mongoose.Schema.Types.String, required: true },
               mobile: { type: mongoose.Schema.Types.String, required: true },
               address: { type: mongoose.Schema.Types.String, required: true },
          },
          name: {
               firstName: { type: mongoose.Schema.Types.String, required: true },
               lastName: { type: mongoose.Schema.Types.String, required: true },
          },
          specialists: [{ type: mongoose.Schema.Types.String, required: true }],
          accountStatus: {
               block: { type: mongoose.Schema.Types.Boolean, default: false },
               online: { type: mongoose.Schema.Types.Boolean, default: false },
               verification: { type: mongoose.Schema.Types.Boolean, default: false },
          },
          acType: { type: mongoose.Schema.Types.String, default: "MENTOR" },
          subCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true }],
     },
     {
          timestamps: true,
     }
);

export const Mentor = mongoose.model<IMentorProps>("Mentor", MentorSchema);
