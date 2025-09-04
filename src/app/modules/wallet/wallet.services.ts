import { IWallet } from './wallet.interface';
import { JwtPayload } from "jsonwebtoken"
import { Wallet } from "./wallet.model"
import AppError from '../../errorHelpers/AppError';
import httpStatus from "http-status-codes"






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


// update wallettype
const updateWalletType =async(userId:string, payload: Partial<IWallet>)=>{

     const isWalletExists = await Wallet.findOne({user:userId});
    //  
    if(!isWalletExists){
        throw new AppError(httpStatus.NOT_FOUND,"Wallet Not Found")
    }

    const result = await Wallet.findOneAndUpdate({user:userId},payload, {new:true, runValidators:true})
    // 
    const data  = {
            walletType:result?.walletType,
            message:`Wallet Type updated to ${result?.walletType} by admin`
        } ;

        return data
     
}




export const WalletServices ={
    // createDeposit,
    getWallet,
    updateWalletStatus,
    updateWalletType,

}