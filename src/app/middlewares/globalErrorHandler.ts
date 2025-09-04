import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";


// 
// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars
export const globalErrorHandler =(err:any, req:Request, res:Response, next:NextFunction)=>{

    // 
    let statusCode = 500;
    let message = `Something went wrong ${err.message} catch on global err handler `
     
      if(err instanceof AppError){
          statusCode = err.statusCode;
          message = err.message;
      }else if(err instanceof Error){
          statusCode = 500;
          message = err.message;
      }
    //  
    res.status(statusCode).json({
        success:false,
        message,
        err,
        // stack used for showing which line error come from 
        stack:envVars.NODE_ENV === "development" ? err.stack : null
    })
}