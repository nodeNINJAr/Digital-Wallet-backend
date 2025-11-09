import { Response } from "express";



export interface AuthTokens{
   accessToken?:string;
   refreshToken?:string;
}


export const setAuthCookies = (res: Response, tokenInfo: AuthTokens) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: isProduction,            // only true in production (HTTPS)
      sameSite: isProduction ? "none" : "lax", // "none" allows cross-site cookies                      // send cookie for all routes
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",

    });
  }
};
