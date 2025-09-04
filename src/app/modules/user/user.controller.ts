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
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, sortBy, sortOrder, searchTerm, ...filters } = req.query;

  const result = await UserServices.getAllUsers({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
    searchTerm: searchTerm as string,
    filters, // role, isActive, etc. will go here
  });

  responseSender(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});




export const UserControllers ={
    createUser,
    getAllUsers,
    updateUser,
    agentStatusUpdate

}