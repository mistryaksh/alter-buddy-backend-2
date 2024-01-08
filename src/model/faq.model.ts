import { IFaqProps } from "interface";
import mongoose from "mongoose";

const FaqSchema = new mongoose.Schema<IFaqProps>(
     {
          answer: { type: mongoose.Schema.Types.String, required: true },
          question: { type: mongoose.Schema.Types.String, required: true },
     },
     {
          timestamps: true,
     }
);

export const Faq = mongoose.model("Faq", FaqSchema);
