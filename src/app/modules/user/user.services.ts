import AppError from "../../errorHelpers/AppError";
import { AgentStatus, IsActive, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs"
import { envVars } from "../../config/env";
import { Wallet } from "../wallet/wallet.model";
import { Status, WalletType } from "../wallet/wallet.interface";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { IStatus, IType } from "../transaction/transaction.interfaces";
import { JwtPayload } from "jsonwebtoken";





// 
const createUser = async (payload: Partial<IUser>) => {

  const { email, password, role, ...rest } = payload;

  const bonusBalance = 5000; // 50 TK in paisa

  if (role === Role.ADMIN || role === Role.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Can't create Admin/Agent manually");
  }

  // check if user already exists
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRIPT_SOLT_ROUND)
  );
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // create user
    const user = await User.create(
      [{ email, password: hashedPassword, role, ...rest }],
      { session }
    );

    // find system/admin wallet
    const adminWallet = await Wallet.findOne({ walletType: WalletType.SYSTEM }).session(session);
    if (!adminWallet) throw new AppError(httpStatus.BAD_REQUEST, "System wallet not found");

    if (adminWallet.balance < bonusBalance) {
      throw new AppError(httpStatus.BAD_REQUEST, "Not enough balance in system wallet");
    }

    // deduct from system wallet
    adminWallet.balance -= bonusBalance;
    await adminWallet.save({ session });

    // create user wallet with bonus balance
    const wallet = await Wallet.create(
      [{
        user: user[0]._id,
        balance: bonusBalance,
        status: Status.ACTIVE,
        walletType: WalletType.PERSONAL,
      }],
      { session }
    );

    // record transaction (bonus credit)
    await Transaction.create([{
      transactionId: `BONUS-${Date.now()}`,
      type: IType.BONUS,
      from: adminWallet._id,
      to: wallet[0]._id,
      amount: bonusBalance,
      tranStatus:IStatus.COMPLETED,
      initiatedBy: user[0]._id,
      notes: "Welcome bonus",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return {
      user: user[0],
      wallet: wallet[0],
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};




// ** update user
const updateUser = async(userId: string, payload: Partial<IUser>)=>{
    // 
    const isUserExist = await User.findById(userId);

      if(!isUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
    // 
    if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
      throw new AppError(httpStatus.FORBIDDEN,`User is ${isUserExist}, Please make your accont active`)
    }

    // 
    if(payload.password){
        payload.password = await bcrypt.hash(payload.password, Number(envVars.BCRIPT_SOLT_ROUND))
  }
  
  //  send to database
  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {new:true, runValidators:true})

  return newUpdateUser;

}


// ** update agentstus
const agentStatusUpdate = async (decodedToken: JwtPayload) => {

  const isUserExist = await User.findById(decodedToken.userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `User is ${isUserExist.isActive}, please make your account active`
    );
  }

  if(isUserExist.role=== Role.AGENT){
    throw new AppError(httpStatus.BAD_REQUEST,"Your Are All ready an agent")
  }

  const updatedAgent = await User.findByIdAndUpdate(
    decodedToken.userId,
    { agentStatus: AgentStatus.PENDING },
    { new: true, runValidators: true }
  );

  return updatedAgent;
};






// ** get all user
const getAllUsers = async()=>{
    // 
    const users = await User.find({});
    // total users
    const totalUser = await User.countDocuments();

    return{
        data:users,
        meta:{
            total:totalUser
        }
    }
}



export const UserServices={
    createUser,
    getAllUsers,
    updateUser,
    agentStatusUpdate


}