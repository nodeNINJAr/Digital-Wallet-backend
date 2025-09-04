import dotEnv from "dotenv"
dotEnv.config();



interface EnvConfig {
  PORT:string;
  MONGODB_URL:string;
  NODE_ENV: "development" | "production";
  BCRIPT_SOLT_ROUND:string;
  JWT_ACCESS_SECRET:string;
  JWT_ACCESS_EXPIRES:string;
  JWT_REFRESH_SECRET:string;
  JWT_REFRESH_EXPIRES:string;
  EXPRESS_SESSION_SECRET:string;
  ADMIN_EMAIL:string,
  ADMIN_PASS:string,


}


// 
const loadEnvVariables = ():EnvConfig=>{

    const requiredEnvVariables:string[] = ["PORT","MONGODB_URL","NODE_ENV","BCRIPT_SOLT_ROUND","JWT_ACCESS_SECRET",
      "JWT_ACCESS_EXPIRES","JWT_REFRESH_SECRET","JWT_REFRESH_EXPIRES","EXPRESS_SESSION_SECRET","ADMIN_EMAIL","ADMIN_PASS"];

    requiredEnvVariables.forEach((key)=>{
         if(!process.env[key]){
              throw new Error(`Missing require environment variable ${key}`)
         }
    })

  return {
    PORT:process.env.PORT as string,
    MONGODB_URL:process.env.MONGODB_URL as string,
    NODE_ENV:process.env.NODE_ENV as "development" | "production",
    BCRIPT_SOLT_ROUND:process.env.BCRIPT_SOLT_ROUND as string,
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES:process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES:process.env.JWT_REFRESH_EXPIRES as string,
    EXPRESS_SESSION_SECRET:process.env.EXPRESS_SESSION_SECRET as string,
    ADMIN_EMAIL:process.env.ADMIN_EMAIL as string,
    ADMIN_PASS:process.env.ADMIN_PASS as string,

  }

}

export const envVars = loadEnvVariables(); 