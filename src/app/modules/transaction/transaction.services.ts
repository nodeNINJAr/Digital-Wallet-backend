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
import { toPaisa } from "../../utils/money";



// ** send money
const sendMoney = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
       
    const session =await startSession();
    session.startTransaction();
      

    //   
     const {to, amount, notes} = payload;
    // amount in paisa
    const amountInPaisa = toPaisa(amount as number);
    const feeInPaisa = Math.round(500); // send money fee 5 taka

    
    //  find sender wallet
     const senderWallet = await Wallet.findOne({user:decodedToken.userId}).session(session);
     
     // validation 1   
     if(!senderWallet || senderWallet.walletType === WalletType.AGENT){
            throw new AppError(httpStatus.CREATED, !senderWallet? "Sender walllet not found": `${senderWallet.walletType} Acccount cant perform sendMoney`)
        }

    // find reciver walllet
     const reciverUser = await User.findOne({email:to});
     const receiverWallet = await Wallet.findOne({user:reciverUser?._id}).session(session);

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
    senderWallet.balance! -= Number(amountInPaisa + feeInPaisa)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    receiverWallet.balance! += Number(amountInPaisa)!
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
          amount:amount,
          fee:feeInPaisa,
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




// ** cash in
const cashIn = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
    // 
    const session =await startSession();
    session.startTransaction();
    // 
    const {to, amount} = payload; 
     // amount in paisa
    const amountInPaisa = toPaisa(amount as number);

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
    senderWallet.balance! -= Number(amountInPaisa)!; 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    receiverWallet.balance! += Number(amountInPaisa)!;
    
    await senderWallet.save({session});
    await receiverWallet.save({session});

    // transaction
    const transaction = await Transaction.create([
         {
          transactionId: `TXN-${Date.now()}`,
          type:IType.CASH_IN,
          from:senderWallet._id,
          to:receiverWallet._id,
          amount:amountInPaisa,
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




// * withdrow money
const withdrawMoney = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
         // 
    const session =await startSession();
    session.startTransaction();

    // 
    const {to, amount, notes} = payload; 
    // amount in paisa
    const amountInPaisa = toPaisa(amount as number);
    const feeInPaisa = Math.round(amountInPaisa * 0.015); // 1.5% fee means 15 taka in 1000


    // sender wallet for withdraw
    const senderWallet = await Wallet.findOne({user:decodedToken.userId}).session(session);
    // ** validation 1
    if(!senderWallet || senderWallet.walletType === WalletType.AGENT){
        throw new AppError(httpStatus.CREATED, !senderWallet? "sender walllet not found": `${senderWallet.walletType} cant procced withdraw`)
    }
    // validation 2
    const reciverUser = await User.findOne({email:to});
    const agentWallet = await Wallet.findOne({user:reciverUser?._id}).session(session);
      // 
      if(!agentWallet || agentWallet.walletType === WalletType.PERSONAL){
        throw new AppError(httpStatus.NOT_FOUND,!agentWallet? "agent walllet not found": `${agentWallet.walletType} Account cant proceed withdraw`)
     }

    // validation 3  blocked check
    if(senderWallet.status ===Status.BLOCKED || agentWallet.status === Status.BLOCKED){
       throw new AppError(httpStatus.BAD_REQUEST, `${senderWallet.status === Status.BLOCKED && senderWallet.walletType} ${agentWallet.status === Status.BLOCKED && agentWallet} wallet Is Blocked`)  
    }
    
    // validation 4
    if((senderWallet.balance ?? 0) < (amountInPaisa ?? 0)){
      throw new AppError(httpStatus.BAD_REQUEST,"Insufficient balance")
    } 
    // detuct from sender/agent adding to personal user
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    senderWallet.balance! -= Number(amountInPaisa + feeInPaisa)!; 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    agentWallet.balance! += Number(amountInPaisa)!;

    await senderWallet.save({session});
    await agentWallet.save({session});


    // transaction
    const transaction = await Transaction.create([
         {
          transactionId: `TXN-${Date.now()}`,
          type:IType.WITHDRAW,
          from:senderWallet._id,
          to:agentWallet._id,
          amount:amountInPaisa,
          fee:feeInPaisa,
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






// * get my transaction
const getMyTransactions = async(decodedToken:JwtPayload)=>{
    //  
     const isUserExist= await User.findById(decodedToken.userId)
    if(!isUserExist){
        throw new AppError(httpStatus.NOT_FOUND,"User Not Found")
    }
    // 
     const isWalletExists = await Wallet.findOne({user:isUserExist._id});
    // blocked check
    if(isWalletExists?.status === Status.BLOCKED){
       throw new AppError(httpStatus.BAD_REQUEST, `${isWalletExists.status === Status.BLOCKED && isWalletExists.walletType} wallet Is Blocked`)  
    }

     //
     const result = await Transaction.find({
        $or:[
            {to:isWalletExists?._id},
            {from:isWalletExists?._id},
        ]
        })
     return result
}



// * get my transaction
const getAllTransactions = async()=>{
   const result = await Transaction.find({});
    return result
}








export const TransactionServices = {
        sendMoney,
        cashIn,
        getMyTransactions,
        getAllTransactions,
        withdrawMoney


}