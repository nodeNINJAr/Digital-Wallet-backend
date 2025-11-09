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
const getUsersWithWalletAndTransactions = async (options: GetAllOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    searchTerm,
    agentStatus, // Keep this for filtering
    filters = {},
  } = options;

  const skip = (page - 1) * limit;

  // Filter only regular users (not agents or admins)
  const query: Record<string, any> = {...filters };

  // Add agentStatus filter directly to query if provided
  if (agentStatus) {
    query.agentStatus = agentStatus;
  }

  // Optional text search
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phone: { $regex: searchTerm} },
    ];
  }

  // Fetch users
  const users = await User.find(query)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  // Enrich each user
  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      const wallet = await Wallet.findOne({ user: user._id });

      const transactionsCount = wallet
        ? await Transaction.countDocuments({
            $or: [{ from: wallet._id }, { to: wallet._id }],
          })
        : 0;
      
     const balance = wallet && wallet?.balance /100 || 0; 

      return {
        userId: user._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        balance,
        agentStatus: user?.agentStatus || "", // Get agentStatus from user
        status: user?.isActive || "",
        joinedDate: user?.createdAt,
        transactions: transactionsCount,
      };
    })
  );

  const totalUsers = await User.countDocuments(query);

  return {
    enrichedUsers,
    total: totalUsers,
    meta: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};



// 
  const getAllAgents = async (options: GetAllOptions = {}) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      searchTerm,
      status, // Add this
      filters = {},
    } = options;

    const skip = (page - 1) * limit;

    // Filter only agents
    const query: Record<string, any> = { role: "agent", ...filters };

    // Optional text search
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Fetch agents
    const agents = await User.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    // Enrich each agent
    let enrichedAgents = await Promise.all(
      agents.map(async (agent) => {
        const wallet = await Wallet.findOne({ user: agent._id });

        const transactionsCount = wallet
          ? await Transaction.countDocuments({
              $or: [{ from: wallet._id }, { to: wallet._id }],
            })
          : 0;

        let commission = 0;
        if (wallet) {
          const commissionData = await Transaction.aggregate([
            {
              $match: {
                $or: [{ from: wallet._id }, { to: wallet._id }],
                type: "commission",
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);
          commission = commissionData[0]?.total || 0;
        }

        return {
          agentId: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          commission: parseFloat(commission.toFixed(2)),
          status: wallet?.status || "ACTIVE",
          joinedDate: agent.createdAt,
          transactions: transactionsCount,
        };
      })
    );

    // Apply status filter AFTER enrichment (since status comes from wallet)
    if (status) {
      enrichedAgents = enrichedAgents.filter(agent => agent.status === status);
    }

    const totalAgents = await User.countDocuments(query);

    return {
      enrichedAgents,
      total: status ? enrichedAgents.length : totalAgents, // Adjust total for filtered results
      meta: {
        page,
        limit,
        total: status ? enrichedAgents.length : totalAgents,
        totalPages: Math.ceil((status ? enrichedAgents.length : totalAgents) / limit),
      },
    };
  };


  // get all users on agent end
  // 
  const getAllusersAg = async (query: any) => {
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
    const filter: any = { role: 'user' };

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
    // Execute query with pagination and sorting
    const users = await User.find(filter)
      .select('-password') // Exclude password
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    if (!users || users.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'No agents found');
    }

    return {
      users,
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
    getUsersWithWalletAndTransactions,
    updateUser,
    agentStatusUpdate,
    getAllAgents,
    getAllusersAg


}