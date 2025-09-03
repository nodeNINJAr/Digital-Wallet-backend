import { JwtPayload } from "jsonwebtoken";
import { IStatus, ITransaction, IType } from "./transaction.interfaces"
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Wallet } from "../wallet/wallet.model";
import { Role } from "../user/user.interface";
import { Status, WalletType } from "../wallet/wallet.interface";
import { startSession } from "mongoose";
import { Transaction } from "./transaction.model";
import { User } from "../user/user.model";



// ** send money
const sendMoney = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
       
    const session =await startSession();
    session.startTransaction();
      
    //   
     const {to, amount, notes} = payload;
    
    //  find sender wallet
     const senderWallet = await Wallet.findOne({user:decodedToken.userId}).session(session);
     
     // validation 1   
     if(!senderWallet || senderWallet.walletType === WalletType.AGENT){
            throw new AppError(httpStatus.CREATED, !senderWallet? "Sender walllet not found": `${senderWallet.walletType} Acccount cant perform sendMoney`)
        }

    // find reciver walllet
     const reciverUser = await User.findOne({email:to});
     const receiverWallet = await Wallet.findOne({user:reciverUser?._id}).session(session);
           console.log(payload, decodedToken,receiverWallet, senderWallet);
      // validation 2 
     if(!receiverWallet){
        throw new AppError(httpStatus.NOT_FOUND,"Reciver wallet Not Found")
     }
     
    // validation 3  blocked check
    if(senderWallet.status ===Status.BLOCKED || receiverWallet.status === Status.BLOCKED){
        throw new AppError(httpStatus.BAD_REQUEST, `${senderWallet.status === Status.BLOCKED && senderWallet.walletType} ${receiverWallet.status === Status.BLOCKED && receiverWallet} wallet Is Blocked`)  
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
    // 
    const session =await startSession();
    session.startTransaction();
    // 
    const {to, amount} = payload; 
    // sender wallet
    const senderWallet = await Wallet.findOne({user:decodedToken.userId}).session(session);
    // ** validation 1
    if(!senderWallet || senderWallet.walletType === WalletType.PERSONAL){
        throw new AppError(httpStatus.CREATED, !senderWallet? "sender walllet not found": `${senderWallet.walletType} user cant process cash-in`)
    }
    // validation 2
    const reciverUser = await User.findOne({email:to});
    const receiverWallet = await Wallet.findOne({user:reciverUser?._id}).session(session);
      // 
      if(!receiverWallet || receiverWallet.walletType === WalletType.AGENT){
        throw new AppError(httpStatus.NOT_FOUND,!receiverWallet? "reciver walllet not found": `${receiverWallet.walletType} cant recived cash-in money`)
     }
     
    // validation 3  blocked check
    if(senderWallet.status ===Status.BLOCKED || receiverWallet.status === Status.BLOCKED){
       throw new AppError(httpStatus.BAD_REQUEST, `${senderWallet.status === Status.BLOCKED && senderWallet.walletType} ${receiverWallet.status === Status.BLOCKED && receiverWallet} wallet Is Blocked`)  
    }
     

    // validation 4
    if((senderWallet.balance ?? 0) < (amount ?? 0)){
      throw new AppError(httpStatus.BAD_REQUEST,"Insufficient balance")
    } 
    // detuct from sender/agent adding to personal user
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    senderWallet.balance! -= Number(amount)!; 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    receiverWallet.balance! += Number(amount)!;
    
    await senderWallet.save({session});
    await receiverWallet.save({session});

    // transaction
    const transaction = await Transaction.create([
         {
          transactionId: `TXN-${Date.now()}`,
          type:IType.CASH_IN,
          from:senderWallet._id,
          to:receiverWallet._id,
          amount,
          fee:0,
          commission:0,
          tranStatus:IStatus.COMPLETED,
          initiatedBy:senderWallet._id
         },
    ],
    { session }
    
)
// commit transaction
await session.commitTransaction();
session.endSession();
return transaction[0]

}






export const TransactionServices = {
        sendMoney,
        cashIn
}