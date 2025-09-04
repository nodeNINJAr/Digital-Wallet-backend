import mongoose from "mongoose";


export enum Status{
    ACTIVE="ACTIVE",
    BLOCKED="BLOCKED"
}



export enum WalletType{
    PERSONAL="PERSONAL",
    AGENT="AGENT",
    SYSTEM="SYSTEM"
}

export interface IWallet{
  user: mongoose.Types.ObjectId;
  balance: number;
  status:Status;
  currency?:string;
  walletType:WalletType;
}
