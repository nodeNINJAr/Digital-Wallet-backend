/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";



// async handler type
type AsyncHandler = (req:Request, res:Response, next:NextFunction) => Promise<void>


//not async
export const catchAsync = (fn:AsyncHandler)=>(req:Request, res:Response, next:NextFunction)=>{

     Promise.resolve(fn(req, res, next)).catch((err)=>{

         if(envVars.NODE_ENV==="development"){
            console.log(err);
         }
         next(err)
     })
}