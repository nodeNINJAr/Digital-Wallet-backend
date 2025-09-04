import { model, Schema } from "mongoose";
import { IWallet, Status, WalletType } from "./wallet.interface";




const walletSchema = new Schema<IWallet>({
      // 
      user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,

      },
      balance:{
        type:Number,
        default:50,
        min:[0, "Balanced Cannot be negetive"]
      },
      status:{
        type:String,
        enum: Object.values(Status),
        default:Status.ACTIVE,
      },
    currency: {
      type: String,
      default: "BDT",
    },
      walletType:{
        type:String,
        default:WalletType.PERSONAL,
      }
},
 {
    timestamps: true,
    versionKey: false,
  }
)


export const Wallet = model<IWallet>("Wallet", walletSchema)