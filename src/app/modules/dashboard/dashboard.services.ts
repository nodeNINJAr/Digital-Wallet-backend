import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { IType } from "../transaction/transaction.interfaces";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { startOfDay, endOfDay } from "date-fns";

// 
const getUserDashboardStats = async (user:JwtPayload) => {
    // 
    const {userId} = user;
    const wallet = await Wallet.findOne({user: userId})
    const objectId = new mongoose.Types.ObjectId(wallet?._id);

    const transactions = await Transaction.find({
        $or: [{ from: objectId }, { to: objectId }],
    })

  const balance = wallet && (wallet?.balance/100)
//
  const thisMonth = new Date().getMonth();
  const monthlyTransactions = transactions.filter(t => new Date(t?.createdAt).getMonth() === thisMonth);
  const monthlyRevenue = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0) /100;
  const moneySent = transactions
    .filter(t => [IType.SEND, IType.CASH_OUT].includes(t.type))
    .reduce((acc, t) => acc + t.amount, 0)/100;

  const moneyReceived = transactions
    .filter(t => [IType.CASH_IN, IType.BONUS].includes(t.type))
    .reduce((acc, t) => acc + t.amount, 0) /100;

  return { balance, monthlyRevenue, moneySent, moneyReceived };
};

// 
const getAgentDashboardStats = async (agent: JwtPayload) => {
    const { userId } = agent;
    
    // Get agent's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    
    const objectId = new mongoose.Types.ObjectId(wallet._id);

    // Get all transactions for this wallet
    const transactions = await Transaction.find({
        $or: [{ from: objectId }, { to: objectId }],
    });

    // Current balance
    const balance = wallet.balance / 100;

    // Calculate total commission (all time)
    const totalCommission = transactions.reduce((acc, t) => {
        if ([IType.CASH_IN, IType.CASH_OUT].includes(t.type)) {
            return acc + (t.commission || 0);
        }
        return acc;
    }, 0) / 100;

    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });

    // Calculate monthly commission
    const monthlyCommission = monthlyTransactions.reduce((acc, t) => {
        if ([IType.CASH_IN, IType.CASH_OUT].includes(t.type)) {
            return acc + (t.commission || 0);
        }
        return acc;
    }, 0) / 100;

    // Calculate monthly cash out
    const monthlyCashOut = monthlyTransactions
        .filter(t => t.type === IType.CASH_OUT && t.from.toString() === objectId.toString())
        .reduce((acc, t) => acc + t.amount, 0) / 100;

    // Count monthly transactions
    const monthlyTransactionCount = monthlyTransactions.length;

    // Get last 7 days for chart data
    const chartData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Filter transactions for this specific day
        const dayTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.createdAt);
            return transactionDate >= date && transactionDate < nextDate;
        });

        // Calculate cash in for the day
        const cashIn = dayTransactions
            .filter(t => t.type === IType.CASH_IN && t.to.toString() === objectId.toString())
            .reduce((acc, t) => acc + t.amount, 0) / 100;

        // Calculate cash out for the day
        const cashOut = dayTransactions
            .filter(t => t.type === IType.CASH_OUT && t.from.toString() === objectId.toString())
            .reduce((acc, t) => acc + t.amount, 0) / 100;

        // Calculate commission for the day
        const commission = dayTransactions
            .filter(t => [IType.CASH_IN, IType.CASH_OUT].includes(t.type))
            .reduce((acc, t) => acc + (t.commission || 0), 0) / 100;

        chartData.push({
            name: dayNames[date.getDay()],
            cashIn: Math.round(cashIn * 100) / 100,
            cashOut: Math.round(cashOut * 100) / 100,
            commission: Math.round(commission * 100) / 100,
        });
    }

    return {
        balance,
        totalTransactions:transactions.length,
        totalCommission,
        monthlyCommission,
        monthlyCashOut,
        monthlyTransactionCount,
        chartData,
    };
};

// admin dashboard
const getDashboardStats = async () => {
    // --- USERS ---
    const totalUsers = await User.countDocuments();
    const totalAgents = await User.countDocuments({ role: "agent" });
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingAgents = await User.countDocuments({
      role: "AGENT",
      agentStatus: "PENDING",
    });

    // --- TRANSACTIONS ---
    const totalTransactions = await Transaction.countDocuments();

    const totalVolumeAgg = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalVolume = totalVolumeAgg[0]?.total || 0;

    // --- TODAY’S STATS ---
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const todayTransactions = await Transaction.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const todayVolumeAgg = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]);
    const todayVolume = todayVolumeAgg[0]?.total || 0;

    // --- RESPONSE ---
   return {
      totalUsers,
      totalAgents,
      totalTransactions,
      totalVolume,
      activeUsers,
      pendingAgents,
      todayTransactions,
      todayVolume,
    };

   
};

// **admin
const getTransactionTrends = async () => {
  
    // Aggregate monthly data
    const trends = await Transaction.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          transactions: { $sum: 1 },
          volume: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Convert month number -> name
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const transactionTrends = trends.map((item) => ({
      month: monthNames[item._id - 1],
      transactions: item.transactions,
      volume: item.volume/100,
    }));

    return transactionTrends;
};

// transition type
const getTransactionTypes = async () => {
    // Group by type and count each
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$type", // assuming type = 'send', 'deposit', 'withdraw', 'payment'
          count: { $sum: 1 },
        },
      },
    ]);

    // Define color map for UI
    const colorMap: Record<string, string> = {
      SEND: "#8b5cf6",
      BONUS: "#3b82f6",
      WITHDRAW: "#10b981",
      payment: "#f59e0b",
    };

    // Map response
     return stats.map((item) => ({
      name:
        item._id === "send"
          ? "Send Money"
          : item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: colorMap[item._id] || "#6b7280",
    }));
};


// 
 const getRecentActivity = async () => {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("initiatedBy", "name email role");

    const formatted = transactions.map((t) => ({
      id: t._id,
      user: t.initiatedBy?.name || "Unknown User",
      action: formatTransactionAction(t),
      time: timeAgo(t.createdAt),
      status: t.tranStatus?.toLowerCase() || "pending",
    }));

    return formatted
  }


// Helper function: Format activity text
function formatTransactionAction(t) {
  switch (t.type) {
    case "SEND":
      return `Sent $${t.amount}`;
    case "DEPOSIT":
      return `Deposited $${t.amount}`;
    case "WITHDRAW":
      return `Withdrew $${t.amount}`;
    case "BONUS":
      return `Received Bonus $${t.amount}`;
    default:
      return t.notes || "Transaction";
  }
}

// Helper: Simple “time ago” formatter
function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}









export const DashboardService ={
     getUserDashboardStats,
     getAgentDashboardStats,
     getDashboardStats,
     getTransactionTrends,
     getTransactionTypes,
     getRecentActivity,
}