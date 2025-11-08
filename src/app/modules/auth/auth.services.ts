import { JwtPayload } from "jsonwebtoken"
import { createNewAccessTokenByRefreshToken } from "../../utils/userTokens"
import { User } from "../user/user.model"
import bcrypt  from "bcryptjs";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env";


// **
const getNewAccessToken = async(refreshToken:string)=>{
  const newAccessToken = await createNewAccessTokenByRefreshToken(refreshToken)

// 
return {
   accessToken:newAccessToken
}
//  
}

  //** */ reset password
 const resetPassword = async(oldPassword:string, newPassword:string, decodedToken:JwtPayload)=>{

   // 
   const user = await User.findById(decodedToken.userId)
   //
   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
   const isOldPasswordMatched = await bcrypt.compare(oldPassword, user!.password as string)
  // 
   if(!isOldPasswordMatched){
      throw new AppError(httpStatus.FORBIDDEN, "Old password does not match")
   };
   // 
   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
   user!.password   = await bcrypt.hash(newPassword, Number(envVars.BCRIPT_SOLT_ROUND));
   
   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
   user!.save();
    
   //  
}



export const  AuthServices = {
    getNewAccessToken,
    resetPassword
} 