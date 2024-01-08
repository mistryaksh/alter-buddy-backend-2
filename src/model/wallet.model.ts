import { IWalletProps } from "interface";
import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema<IWalletProps>(
     {
          balance: { type: mongoose.Schema.Types.Number, required: true },
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: 100 },
          currency: { type: mongoose.Schema.Types.String, default: "in" },
     },
     { timestamps: true }
);

export const Wallet = mongoose.model<IWalletProps>("Wallet", WalletSchema);
