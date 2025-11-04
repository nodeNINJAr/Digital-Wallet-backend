import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";


export const validationRequest =(zodSchema:ZodObject)=> async(req:Request, res:Response, next:NextFunction)=>{

try{
             
  req.body = await zodSchema.parseAsync(req.body);
    next();
    // console.log(req.body);  

  }catch(err){
    next(err)
 }


}