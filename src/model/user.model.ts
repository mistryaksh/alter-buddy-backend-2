import { IUserProps } from "interface/user.interface";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<IUserProps>(
     {
          acType: { type: mongoose.Schema.Types.String, required: true, default: "USER" },
          email: { type: mongoose.Schema.Types.String, required: true },
          mobile: { type: mongoose.Schema.Types.String, required: true },
          password: { type: mongoose.Schema.Types.String, required: true },
          name: {
               firstName: { type: mongoose.Schema.Types.String, required: true },
               lastName: { type: mongoose.Schema.Types.String, required: true },
          },
          block: { type: mongoose.Schema.Types.Boolean, default: false },
          verified: { type: mongoose.Schema.Types.Boolean, default: false },
          online: { type: mongoose.Schema.Types.Boolean, default: false },
     },
     {
          timestamps: true,
     }
);

export const User = mongoose.model<IUserProps>("User", UserSchema);
