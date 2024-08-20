import mongoose from "mongoose";

export interface IPackagesProps {
  categoryId: mongoose.Schema.Types.ObjectId;
  packageType: "video" | "audio" | "chat";
  packageName: string;
  description?: string;
  price: number;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  status: boolean;
}
