/* eslint-disable no-console */
import { JwtPayload } from "jsonwebtoken";
import { IStatus, ITransaction, IType } from "./transaction.interfaces"
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Wallet } from "../wallet/wallet.model";
import { Role } from "../user/user.interface";
import { Status } from "../wallet/wallet.interface";
import { startSession } from "mongoose";
import { Transaction } from "./transaction.model";



// ** send money
const sendMoney = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
       
    const session =await startSession();
    session.startTransaction();
      
    //   
     const {to, amount, notes} = payload;

    //  find sender wallet
     const senderWallet = await Wallet.findOne({user:decodedToken.userId}).session(session);
     // validation 1   
     if(!senderWallet){
        throw new AppError(httpStatus.NOT_FOUND, "Sender wallet Not Found")
     }

    // find reciver walllet
     const receiverWallet = await Wallet.findOne({user:to}).session(session);
           console.log(payload, decodedToken, receiverWallet, senderWallet);
      // validation 2 
     if(!receiverWallet){
        throw new AppError(httpStatus.NOT_FOUND,"Reciver wallet Not Found")
     }
     
    // validation 3  blocked check
    if(senderWallet.status ===Status.BLOCKED || receiverWallet.status === Status.BLOCKED){
       throw new AppError(httpStatus.BAD_REQUEST, `${senderWallet.walletType} ${senderWallet.walletType} wallet Is Blocked`)  
    }
     
    // validation 4
    if((senderWallet.balance ?? 0) < (amount ?? 0)){
      throw new AppError(httpStatus.BAD_REQUEST,"Insufficient balance")
    }

    // ** detuct from sender wallet and add to reciver
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    senderWallet.balance! -= Number(amount)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    receiverWallet.balance! += Number(amount)!
    // 
    await senderWallet.save({session});
    await receiverWallet.save({session});

    // transaction
    const transaction = await Transaction.create([
         {
          transactionId: `TXN-${Date.now()}`,
          type:IType.SEND,
          from:senderWallet._id,
          to:receiverWallet._id,
          amount,
          fee:0,
          commission:0,
          tranStatus:IStatus.COMPLETED,
          initiatedBy:senderWallet._id,
          notes
         },
    ],
    { session }
)
    
// commit transaction
await session.commitTransaction();
session.endSession();
return transaction[0]

}

//   transactionId: string;
//   type:IType; 
//   from?: mongoose.Types.ObjectId;  // sender wallet
//   to?: mongoose.Types.ObjectId;    // receiver wallet
//   amount: number;
//   fee?: number;
//   commission?: number;
//   tranStatus: IStatus;
//   initiatedBy: mongoose.Types.ObjectId; // user or agent who initiated
//   notes?: string;


// ** cash 
const cashIn = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
  
    

}








export const TransactionServices = {
        sendMoney,
}