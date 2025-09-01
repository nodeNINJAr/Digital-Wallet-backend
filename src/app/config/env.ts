import dotEnv from "dotenv"
dotEnv.config();



interface EnvConfig {
  PORT:String;
  MONGODB_URL:String;
  NODE_ENV: "development" | "production";



}


// 
const loadEnvVariables = ():EnvConfig=>{

    const requiredEnvVariables:string[] = ["PORT","MONGODB_URL","NODE_ENV"];

    requiredEnvVariables.forEach((key)=>{
        console.log(key);
         if(!process.env[key]){
              throw new Error(`Missing require environment variabl ${key}`)
         }
    })

  return {
    PORT:process.env.PORT as String,
    MONGODB_URL:process.env.MONGODB_URL!,
    NODE_ENV:process.env.NODE_ENV as "development" | "production"

  }

}

export const envVars = loadEnvVariables(); 