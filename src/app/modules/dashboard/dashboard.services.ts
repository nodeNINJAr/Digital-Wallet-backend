import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { IType } from "../transaction/transaction.interfaces";


// 
const getUserDashboardStats = async (user) => {
    // 
    const {userId} = user;
    const wallet = await Wallet.findOne({user: userId})
    const objectId = new mongoose.Types.ObjectId(wallet?._id);

    const transactions = await Transaction.find({
        $or: [{ from: objectId }, { to: objectId }],
    })

  const balance = (wallet?.balance/100)
//
  const thisMonth = new Date().getMonth();
  const monthlyTransactions = transactions.filter(t => new Date(t?.createdAt).getMonth() === thisMonth);
  const monthlyRevenue = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0) /100;
  const moneySent = transactions
    .filter(t => [IType.SEND, IType.WITHDRAW].includes(t.type))
    .reduce((acc, t) => acc + t.amount, 0)/100;

  const moneyReceived = transactions
    .filter(t => [IType.CASH_IN, IType.CASH_OUT, IType.BONUS].includes(t.type))
    .reduce((acc, t) => acc + t.amount, 0) /100;

  return { balance, monthlyRevenue, moneySent, moneyReceived };
};


export const DashboardService ={
     getUserDashboardStats,

}