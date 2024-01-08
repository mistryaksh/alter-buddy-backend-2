import mongoose from "mongoose";

export interface IWalletProps {
     balance: number;
     userId: mongoose.Schema.Types.ObjectId;
     currency: "in";
}
