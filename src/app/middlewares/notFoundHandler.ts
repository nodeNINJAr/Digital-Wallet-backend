
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';


// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars
export const notFound =(req:Request, res:Response)=>{
    res.status(httpStatus.NOT_FOUND).json({
        success:false,
        message:"Route Not Found"
    });

}