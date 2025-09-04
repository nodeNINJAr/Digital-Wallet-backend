/* eslint-disable no-unused-vars */
import mongoose from "mongoose";



export enum IType {
    CASH_IN="CASH_IN",
    CASH_OUT="CASH_OUT",
    SEND="SEND",
    WITHDRAW="WITHDRAW",
    BONUS="BONUS"
}


export enum IStatus {
    PENDING="PENDING",
    COMPLETED="COMPLETED",
    FAILED="FAILED",
}


export interface ITransaction {
  transactionId: string;
  type:IType; 
  from?: mongoose.Types.ObjectId;  // sender wallet
  to?: mongoose.Types.ObjectId;    // receiver wallet
  amount: number;
  fee?: number;
  commission?: number;
  tranStatus: IStatus;
  initiatedBy: mongoose.Types.ObjectId; // user or agent who initiated
  notes?: string;
}

// ** 🔹 3. How Operations Work (Business Logic)

// Registration

// Create User

// Auto-create Wallet with balance ৳50

// Send Money (user → user)

// Validate: both wallets active, sufficient balance

// Deduct from sender

// Add to receiver

// Record transaction

// If any step fails → rollback (use MongoDB transactions)

// Cash-in (agent → user)

// Agent initiates

// Add to user wallet

// Record commission for agent

// Save transaction

// Withdraw (user → agent)

// Deduct from user

// Add to agent (optional)

// Record transaction

// Admin Actions

// PATCH /wallets/:id/block → block wallet

// GET /transactions → see all transactions

// PATCH /agents/:id/approve → approve agent

// 🔹 4. Example API Endpoints

// Auth

// POST /auth/register

// POST /auth/login

// User

// GET /users/me (profile)

// GET /users/:id (admin only)

// Wallet

// GET /wallets/me

// PATCH /wallets/block/:id (admin)

// Transactions

// POST /transactions/send

// POST /transactions/withdraw

// POST /transactions/cash-in

// GET /transactions/me

// GET /transactions (admin)

// ✅ With this design:

// Data is normalized (wallet separate from user, so easy to block/manage)

// Transactions are always recorded

// Role-based access is enforceable 
