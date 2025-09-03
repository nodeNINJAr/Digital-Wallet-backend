/* eslint-disable @typescript-eslint/no-explicit-any */
import { responseSender } from './../../utils/responseSender';
/* eslint-disable no-console */
import passport from "passport";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express';
import { setAuthCookies } from '../../utils/setCookies';
import { AuthServices } from './auth.services';
import { JwtPayload } from 'jsonwebtoken';






// 
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
     //    
      passport.authenticate("local", async (err: any, user: any, info: any) => {
        

        if (err) {
            console.log("from err", err);
            return next(new AppError(401, err))
        }

        if (!user) {
           
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserTokens(user)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const { password: pass, ...rest } = user.toObject()

        setAuthCookies(res, userTokens)

        responseSender(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest

            },
        })
    })(req, res, next)

})



// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const getNewAccessTokens = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
    // 
    const refreshToken = req.cookies.refreshToken;
    
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);
     
    setAuthCookies(res, tokenInfo)
    //    
    responseSender(res, {
    success:true, 
    statusCode:httpStatus.OK,
    message:"New Token Genarated Successfully",
    data:tokenInfo,
    })


})


// 
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const userLogOut = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{

    res.clearCookie("accessToken",{
    httpOnly:true,
    secure:false,
    sameSite:"lax",
    })  
    // 
   res.clearCookie("refreshToken",{
      httpOnly:true,
      secure:false,
      sameSite:"lax",
   })
    //    
    responseSender(res, {
    success:true, 
    statusCode:httpStatus.OK,
    message:"User Logged Out Successfully",
    data:null,
    })


})

// ** reset password
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const resetPassword = catchAsync(async(req:Request, res:Response , next:NextFunction)=>{
    // 
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword;
    const decodedToken = req.user;
    // 
    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload)
    //    
    responseSender(res, {
    success:true, 
    statusCode:httpStatus.OK,
    message:"Password reset Successfully",
    data:null,
    })


})




// 

export const AuthControllers = {
      credentialsLogin,
      getNewAccessTokens,
      userLogOut,
      resetPassword,
}