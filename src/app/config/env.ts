import dotEnv from "dotenv"
dotEnv.config();



interface EnvConfig {
  PORT:string;
  MONGODB_URL:string;
  NODE_ENV: "development" | "production";



}


// 
const loadEnvVariables = ():EnvConfig=>{

    const requiredEnvVariables:string[] = ["PORT","MONGODB_URL","NODE_ENV"];

    requiredEnvVariables.forEach((key)=>{
         if(!process.env[key]){
              throw new Error(`Missing require environment variabl ${key}`)
         }
    })

  return {
    PORT:process.env.PORT as string,
    MONGODB_URL:process.env.MONGODB_URL as string,
    NODE_ENV:process.env.NODE_ENV as "development" | "production"

  }

}

export const envVars = loadEnvVariables(); 