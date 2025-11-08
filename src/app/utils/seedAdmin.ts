/* eslint-disable no-console */
import { envVars } from "../config/env";
import { IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from "bcryptjs"
import { Wallet } from "../modules/wallet/wallet.model";
import { Status, WalletType } from "../modules/wallet/wallet.interface";



export const seedAdmin =async()=>{
    // 
      try{
        const isSuperAdminExist = await User.findOne({email:envVars.ADMIN_EMAIL});
        // 
        if(isSuperAdminExist){
            console.log("Super Admin alredy exists");
            return 
        }

    // hasded pass by bcript
        const hashedPassword = await bcrypt.hash(envVars.ADMIN_PASS, Number(envVars.BCRIPT_SOLT_ROUND));
        //  

    // 
    const payLoad:IUser = {
        name:"Admin",
        email:envVars.ADMIN_EMAIL,
        role:Role.ADMIN,
        isVerified:true,
        password:hashedPassword,
    }
      //    
      const Admin = await User.create(payLoad);
      console.log("Admin Created Successfully! \n");
      
      
      await Wallet.create({
            user:Admin._id,
            balance:50000*100,
            status:Status.ACTIVE,
            walletType:WalletType.SYSTEM
      })


      }catch(err){
        console.log(err);
      }
}