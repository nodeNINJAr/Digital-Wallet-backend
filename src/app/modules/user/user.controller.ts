/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { responseSender } from "../../utils/responseSender"
import httpStatus from "http-status-codes"
import { UserServices } from "./user.services"
import { JwtPayload } from "jsonwebtoken"




// ** create user

const createUser =  catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
   const user = await UserServices.createUser(req.body);

 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"User Created Successfully",
   data:user,
})

})


// **


// ** user data update
const updateUser =  catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
       
   const user = await UserServices.updateUser(req.params.id, req.body);

 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"User updated Successfully",
   data:user,
})

})


// agent status update
const agentStatusUpdate = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
   const decodedToken = req.user as JwtPayload;
  //  
   const user = await UserServices.agentStatusUpdate(decodedToken as JwtPayload);
 
   //
 responseSender(res, {
   success:true,
   statusCode:httpStatus.CREATED,
   message:"AgentStatus updated to pending",
   data:user,
})

})



// ** get alluser
const getAllUsers = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{

      const result = await UserServices.getAllUsers();

      responseSender(res,{
            success:true,
            statusCode:httpStatus.OK,
            message:"User Retrived Successfully",
            data:result.data,
            meta:result.meta
      })
})




export const UserControllers ={
    createUser,
    getAllUsers,
    updateUser,
    agentStatusUpdate

}