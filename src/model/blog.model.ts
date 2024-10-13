import { IBlogProps } from "interface";
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema<IBlogProps>(
  {
    body: { type: mongoose.Schema.Types.String, required: true },
    label: { type: mongoose.Schema.Types.String, required: true },
    subLabel: { type: mongoose.Schema.Types.String },
    blogLink: { type: mongoose.Schema.Types.String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model<IBlogProps>("Blog", BlogSchema);
