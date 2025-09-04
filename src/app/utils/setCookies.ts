import { Response } from "express";



export interface AuthTokens{
   accessToken?:string;
   refreshToken?:string;
}


export const setAuthCookies =(res:Response, tokenInfo:AuthTokens)=>{
        // 
        if(tokenInfo.accessToken){
            // acces token set to cookie    
               res.cookie("accessToken", tokenInfo.accessToken,{
                 httpOnly:true,
                 secure:false,
               })    
        }
        // 
        if(tokenInfo.refreshToken){   
            // refrsh token set to cookies
            res.cookie("refreshToken", tokenInfo.refreshToken,{
                httpOnly:true,
                secure:false,
            })    

        }
}