/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { responseSender } from "../../utils/responseSender";
import httpStatus from "http-status-codes";
import { WalletServices } from "./wallet.services";
import { JwtPayload } from "jsonwebtoken";




// const createDeposit = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
//  responseSender(res, {
//    success:true,
//    statusCode:httpStatus.CREATED,
//    message:"User Created Successfully",
//    data:user,
// })

// }


const getWallet = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
  //  
  const decodedToken = req.user;
  const result = await WalletServices.getWallet(decodedToken as JwtPayload);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"Wallet Retrived Successfully",
   data:result
})

})

// ** updateWalletStatus
const updateWalletStatus = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{

  const result = await WalletServices.updateWalletStatus(req.params.id, req.body);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"Wallet status updated succesfully",
   data:result
})

})

// ** update wallet type

const updateWalletType = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{

  const result = await WalletServices.updateWalletType(req.params.id, req.body);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"Wallet Type updated succesfully",
   data:result
})

})


// ** suspendAgentStatus

const suspendAgentStatus = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{

  const result = await WalletServices.updateWalletType(req.params.id, req.body);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:`Agent gentally sunpended by admin due to some reason`,
   data:result
})

})




export const WalletController ={
    // createDeposit,
    getWallet,
    updateWalletStatus,
    updateWalletType,
    suspendAgentStatus
}