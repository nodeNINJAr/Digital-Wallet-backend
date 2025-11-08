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
export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;
  const { page, limit, sortBy, sortOrder, type, status, dateFrom, dateTo, search } = req.query;

  const filters: Record<string, any> = {};
  if (type && type !== 'all') filters.type = type;
  if (status && status !== 'all') filters.tranStatus = status;

  if (dateFrom || dateTo) {
    filters.createdAt = {};
    if (dateFrom) filters.createdAt.$gte = new Date(dateFrom as string);
    if (dateTo) filters.createdAt.$lte = new Date(dateTo as string);
  }

  if (search) {
    const regex = new RegExp(search as string, 'i'); // case-insensitive
    filters.$or = [
      { transactionId: regex },
      { notes: regex },
      { type: regex },
    ];
  }

  const result = await TransactionServices.getMyTransactions(decodedToken as JwtPayload, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || 'createdAt',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    filters,
  });

  return responseSender(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Transactions retrieved successfully',
    data: result,
  });
});




// ** getAllTransactions
const getAllTransactions = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{

  const { page, limit, sortBy, sortOrder, ...filters} = req.query;
  //   
  const result = await TransactionServices.getAllTransactions({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
    filters,
  });
 
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