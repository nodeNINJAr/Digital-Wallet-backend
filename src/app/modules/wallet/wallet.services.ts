import { IWallet, Status } from './wallet.interface';
import { JwtPayload } from "jsonwebtoken"
import { Wallet } from "./wallet.model"
import AppError from '../../errorHelpers/AppError';
import httpStatus from "http-status-codes"
import { User } from '../user/user.model';
import { AgentStatus } from '../user/user.interface';






// get user wallet
const getWallet =async(decodedToken:JwtPayload)=>{

     const userWallet = await Wallet.findOne({user:decodedToken.userId});

    return userWallet
     
}


// user walllet status update
const updateWalletStatus =async(userId:string, payload: Partial<IWallet>)=>{

     const isWalletExists = await Wallet.findOne({user:userId});
    //  
    if(!isWalletExists){
        throw new AppError(httpStatus.NOT_FOUND,"Wallet Not Found")
    }

    const result = await Wallet.findOneAndUpdate({user:userId},payload, {new:true, runValidators:true})
    // 
    const data  = {
        status:  result?.status,
        message:`Wallet ${result?.status} by admin`
    } ;

    return data
     
}



//  wallettype
const updateWalletType =async(userId:string, payload: Partial<IWallet>)=>{
    const isWalletExists = await Wallet.findOne({user:userId});
    const user = await User.findById(userId);

    if(user?.agentStatus !== AgentStatus.PENDING){
        throw new AppError(httpStatus.BAD_REQUEST, "This user is not requesting for Agent")
    }

    //  
    if(!isWalletExists){
        throw new AppError(httpStatus.NOT_FOUND,"Wallet Not Found")
    }

    if(isWalletExists.status === Status.BLOCKED){
        throw new AppError(httpStatus.BAD_REQUEST, "You Can't make wallet type changes when its BLOCKED")
    }
    

    const result = await Wallet.findOneAndUpdate({user:userId},payload, {new:true, runValidators:true})

    const updatedRole = await User.findByIdAndUpdate(userId,{role:payload.walletType, agentStatus:AgentStatus.APPROVED}, {new:true, runValidators:true})

    // 
    const data  = {
            updatedRole,
            walletType:result?.walletType,
            message:`Wallet Type updated to ${result?.walletType} by admin`
        } ;

        return data
     
}

// agent suspend
const suspendAgentStatus=async(userId:string)=>{
    // 
    const updatedRole = await User.findByIdAndUpdate(userId,{agentStatus:AgentStatus.SUSPENDED}, {new:true, runValidators:true})
        return updatedRole
}



export const WalletServices ={
    // createDeposit,
    getWallet,
    updateWalletStatus,
    updateWalletType,
    suspendAgentStatus

}