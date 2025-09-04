import { Schema } from "mongoose";
import { IStatus, ITransaction, IType } from "./transaction.interfaces";
import { model } from "mongoose";





const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      unique: true
    },
    type: {
      type: String,
      enum: IType,
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },
    fee: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    tranStatus: {
      type: String,
      enum: IStatus,
      default: IStatus.PENDING,
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


// Auto-generate transactionId before saving
transactionSchema.pre("save", function (next) {
  if (!this.transactionId) {
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const date = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 8); // YYYYMMDD
    this.transactionId = `TXN-${date}-${random}`;
  }
  next();
});




export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);