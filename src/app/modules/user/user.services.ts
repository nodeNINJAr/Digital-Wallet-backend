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
import { GetAllOptions } from "../../interfaces/paginationInterfaces";





// 
const createUser = async (payload: Partial<IUser>) => {

  const { email, password, role, phone, ...rest } = payload;

  // Define the bonus balance
  const bonusBalance = 5000; // 50 TK in paisa

  // Prevent creation of Admin role manually
  if (role === Role.ADMIN) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Can't create Admin manually");
  }

  // Check if the user already exists based on email or phone
  const isUserExist = await User.findOne({
    email
  });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRIPT_SOLT_ROUND) // Adjust the salt rounds as per your environment
  );

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the user in the database
    const user = await User.create(
      [{
        email,
        password: hashedPassword,
        phone,
        ...rest,
      }],
      { session }
    );

    // If role is 'AGENT', set status to PENDING
    if (await(role === Role.AGENT)) {
      await User.findByIdAndUpdate(
         {_id: user[0]._id}, 
        { agentStatus: AgentStatus.PENDING ,},
        { new: true, runValidators: true, session }
      );
    }

    // Find the system wallet
    const adminWallet = await Wallet.findOne({ walletType: WalletType.SYSTEM }).session(session);
    if (!adminWallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "System wallet not found");
    }

    // Check if there is enough balance in the system wallet
    if (adminWallet.balance < bonusBalance) {
      throw new AppError(httpStatus.BAD_REQUEST, "Not enough balance in system wallet");
    }

    // Deduct the bonus from the system wallet
    adminWallet.balance -= bonusBalance;
    await adminWallet.save({ session });

    // Create a personal wallet for the user with the bonus balance
    const wallet = await Wallet.create(
      [{
        user: user[0]._id,
        balance: bonusBalance,
        status: Status.ACTIVE,
        walletType: WalletType.PERSONAL,
      }],
      { session }
    );

    // Record the bonus credit transaction
    await Transaction.create([{
      transactionId: `BONUS-${Date.now()}`,
      type: IType.BONUS,
      from: adminWallet._id,
      to: wallet[0]._id,
      amount: bonusBalance,
      tranStatus: IStatus.COMPLETED,
      initiatedBy: user[0]._id,
      notes: "Welcome bonus",
    }], { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      user: user[0],  // Return the created user
      wallet: wallet[0],  // Return the created wallet
    };

  } catch (error) {
    // Abort the transaction if there is an error
    await session.abortTransaction();
    session.endSession();
    throw error;  // Re-throw the error for the caller to handle
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




// ** get all users
const getAllUsers = async (options: GetAllOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    searchTerm,
    filters = {},
  } = options;

  const skip = (page - 1) * limit;

  // query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { ...filters };

  // add text search across fields
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phone: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  const totalUser = await User.countDocuments(query);

  return {
    data: users,
    meta: {
      page,
      limit,
      total: totalUser,
      totalPages: Math.ceil(totalUser / limit),
    },
  };
};

// 
  const getAllAgents = async (query: any) => {
    const {
      search,
      location,
      isActive = 'active',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter object
    const filter: any = { role: 'agent' };

    // Add status filter if provided
    if (isActive) {
      filter.isActive = isActive;
    }

    // Add search filter (searches in name, email, phone)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Add location filter if provided
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
     console.log(filter);
    // Execute query with pagination and sorting
    const agents = await User.find(filter)
      .select('-password') // Exclude password
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    if (!agents || agents.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'No agents found');
    }

    return {
      agents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  };




export const UserServices={
    createUser,
    getAllUsers,
    updateUser,
    agentStatusUpdate,
    getAllAgents


}