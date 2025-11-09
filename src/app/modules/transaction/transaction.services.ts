import { JwtPayload } from "jsonwebtoken";
import { IStatus, ITransaction, IType } from "./transaction.interfaces"
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Wallet } from "../wallet/wallet.model";
import { Status, WalletType } from "../wallet/wallet.interface";
import { startSession } from "mongoose";
import { Transaction } from "./transaction.model";
import { User } from "../user/user.model";
import { toPaisa } from "../../utils/money";
import mongoose from "mongoose";


// ** send money
const sendMoney = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
    // 
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
     
    // 
    const adminWallet = await Wallet.findOne({ walletType: WalletType.SYSTEM }).session(session);
    if (!adminWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Admin wallet not found");
    }


    // ** detuct from sender wallet and add to reciver
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    senderWallet.balance! -= Number(amountInPaisa + feeInPaisa)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    receiverWallet.balance! += Number(amountInPaisa)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    adminWallet.balance! += Number(feeInPaisa)!

    // 
    await senderWallet.save({session});
    await receiverWallet.save({session});
    await adminWallet.save({session});

    // transaction
    const transaction = await Transaction.create([
         {
          type:IType.SEND,
          from:senderWallet._id,
          to:receiverWallet._id,
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

// ** cash in
const cashIn = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
    // 
    const session =await startSession();
    session.startTransaction();
    // 
    const {to, amount, notes} = payload; 
     // amount in paisa
    const amountInPaisa = toPaisa(amount as number);
    const commission = Math.floor((amountInPaisa * 2) / 1000); //2 taka commition in 1000 tka cash in
    
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

    const adminWallet = await Wallet.findOne({ walletType: WalletType.SYSTEM }).session(session);
    if (!adminWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Admin wallet not found");
    }

    // detuct from sender/agent adding to personal user
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    senderWallet.balance! -= Number(amountInPaisa - commission)!; 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    receiverWallet.balance! += Number(amountInPaisa)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    adminWallet.balance! -= Number(commission)!
    
    // 
    await senderWallet.save({session});
    await receiverWallet.save({session});
    await adminWallet.save({session})

    // transaction
    const transaction = await Transaction.create([
         {
          type:IType.CASH_IN,
          from:senderWallet._id,
          to:receiverWallet._id,
          amount:amountInPaisa,
          fee:0,
          commission:commission,
          tranStatus:IStatus.COMPLETED,
          initiatedBy:senderWallet._id,
          notes:notes,
         },
    ],
    { session }
    
)
// commit transaction
await session.commitTransaction();
session.endSession();
return transaction[0]

}

// * cashout money
const cashOut = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
         // 
    const session =await startSession();
    session.startTransaction();

    // 
    const {to, amount, notes} = payload; 
    // amount in paisa
    const amountInPaisa = toPaisa(amount as number);
    const feeInPaisa = Math.round(amountInPaisa * 0.015); // 1.5% fee means 15 taka in 1000
    const commission = Math.floor((feeInPaisa * 150) / 1000); // fee 15% for agent commission
    const afterCommission = feeInPaisa - commission;

    
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
       throw new AppError(httpStatus.BAD_REQUEST, `This ${senderWallet.status === Status.BLOCKED ? senderWallet.walletType:""} ${agentWallet.status === Status.BLOCKED ? agentWallet : ""} wallet Is Blocked`)  
    }
    // amount check
    if(amountInPaisa < 5000){
        throw new AppError(httpStatus.BAD_REQUEST,"Minimum cashOut is 50 taka")
    }
    // validation 4
    if((senderWallet.balance ?? 0) < (amountInPaisa ?? 0)){
      throw new AppError(httpStatus.BAD_REQUEST,"Insufficient balance")
    } 

    // 
    const adminWallet = await Wallet.findOne({ walletType: WalletType.SYSTEM }).session(session);
    if (!adminWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Admin wallet not found");
    }

    // detuct from sender/agent adding to personal user
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    senderWallet.balance! -= Number(amountInPaisa + feeInPaisa)!; 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    agentWallet.balance! += Number(amountInPaisa + commission)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    adminWallet.balance! += Number(afterCommission)!

    await senderWallet.save({session});
    await agentWallet.save({session});
    await adminWallet.save({session});


    // transaction
    const transaction = await Transaction.create([
         {
          transactionId: `TXN-${Date.now()}`,
          type:IType.CASH_OUT,
          from:senderWallet._id,
          to:agentWallet._id,
          amount:amountInPaisa,
          fee:feeInPaisa,
          commission:commission,
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

// * cashout money
const withdraw = async(decodedToken:JwtPayload, payload:Partial<ITransaction>)=>{
     return `${decodedToken} user wait we will connect to you ${payload.to}`
    
}


// * get all transaction role based
const getTransactions = async (
  decodedToken: JwtPayload,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
    search?: string;
  }
) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filters = {}, search } = options;
  const skip = (page - 1) * limit;

  // Find user
  const user = await User.findById(decodedToken.userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User Not Found');

  // If admin → show all transactions (skip wallet check)
  let query: any = { $and: [{ ...filters }] };

  if (user.role !== 'admin') {
    // Find wallet
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, 'Wallet Not Found');
    if (wallet.status === 'BLOCKED') throw new AppError(httpStatus.BAD_REQUEST, 'Wallet is blocked');

    const objectId = new mongoose.Types.ObjectId(wallet._id);

    // Restrict to user's transactions
    query.$and.unshift({
      $or: [{ from: objectId }, { to: objectId }],
    });
  }

  // Add search conditions
  if (search) {
    query.$and.push({
      $or: [
        { transactionId: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ],
    });
  }

  // Fetch transactions
  const transactions = await Transaction.find(query)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  return {
    transactions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};






export const TransactionServices = {
        sendMoney,
        cashIn,
        getTransactions,
        cashOut,
        withdraw,
        

}