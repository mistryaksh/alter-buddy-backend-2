import { ITeamProps } from "interface";
import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema<ITeamProps>(
  {
    dept: { type: mongoose.Schema.Types.String, required: true },
    image: { type: mongoose.Schema.Types.String, required: true },
    name: { type: mongoose.Schema.Types.String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.model<ITeamProps>("Team", TeamSchema);
