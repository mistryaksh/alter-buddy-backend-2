import { ISubCategoryProps } from "interface";
import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema<ISubCategoryProps>(
     {
          categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
          label: { type: mongoose.Schema.Types.String, required: true },
          desc: { type: mongoose.Schema.Types.String, required: true },
          causes: [{ type: mongoose.Schema.Types.String, required: true }],
          subTitle: { type: mongoose.Schema.Types.String, required: true },
          symptoms: [{ type: mongoose.Schema.Types.String, required: true }],
          treatment: [{ type: mongoose.Schema.Types.String, required: true }],
     },
     { timestamps: true }
);

export const SubCategory = mongoose.model<ISubCategoryProps>("SubCategory", SubCategorySchema);
