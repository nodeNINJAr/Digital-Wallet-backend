/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { responseSender } from "../../utils/responseSender";
import httpStatus from "http-status-codes";
import { TransactionServices } from "./transaction.services";
import { JwtPayload } from "jsonwebtoken";




// ** sendMoney
const sendMoney = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
   
    // 
     const decodedToken = req.user;
     const result = await TransactionServices.sendMoney(decodedToken as JwtPayload , req.body);
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"Send Money succesfully",
   data:result
})

});

// ** cashIn
const cashIn = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
//    
  const decodedToken = req.user;
  const result = await TransactionServices.cashIn(decodedToken as JwtPayload , req.body);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"Cash In succesfully",
   data:result
})

});


// ** withdraw
const withdrawMoney = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
  
  const decodedToken = req.user;

  const result = await TransactionServices.withdrawMoney(decodedToken as JwtPayload, req.body);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"Money withdraw succesfully",
   data:result
})

});




// ** getMyTransactions
const getMyTransactions = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
    
  //   
  const decodedToken = req.user;
  //   
  const result = await TransactionServices.getMyTransactions(decodedToken as JwtPayload);
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.OK,
   message:"Transaction retrived succesfully",
   data:result
})

});


// ** getAllTransactions
const getAllTransactions = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
  //   
  const result = await TransactionServices.getAllTransactions();
 
  //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.OK,
   message:"All Transactions Reterived Successfully",
   data:result
})

});


export const TransactionController = {
      sendMoney,
      cashIn,
      withdrawMoney,
      getMyTransactions,
      getAllTransactions,
}