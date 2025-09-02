import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs"
import { envVars } from "../../config/env";
import { createUserTokens } from "../../utils/userTokens";



// ** user creation
const createUser =async(payload:Partial<IUser>)=>{

   // payload from body
   const {email, password, ...rest} = payload;
  //checking if user is exist or not
  const isUserExit = await User.findOne({email});
  if(isUserExit){
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
  }
 //  password hashing 
 const hashdPassword = await bcrypt.hash(password as string, Number(envVars.BCRIPT_SOLT_ROUND));
 const userToken = createUserTokens(payload);
  console.log(userToken);

  
 //    
 const user = User.create({
    email,
    hashdPassword,
    ...rest,
 })

  return user;
}




// ** update user
const updateUser = async(userId: string, payload: Partial<IUser>)=>{
    // 
    const isUserExist = await User.findById(userId);

      if(!isUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
    // 
    if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
      throw new AppError(httpStatus.FORBIDDEN,`User is ${isUserExist}, Please make your accont active`)
    }

    // 
    if(payload.password){
        payload.password = await bcrypt.hash(payload.password, Number(envVars.BCRIPT_SOLT_ROUND))
  }
  
  //  send to database
  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {new:true, runValidators:true})

  return newUpdateUser;


}





// ** get all user
const getAllUsers = async()=>{
    // 
    const users = await User.find({});
    // total users
    const totalUser = await User.countDocuments();

    return{
        data:users,
        meta:{
            total:totalUser
        }
    }
}



export const UserServices={
    createUser,
    getAllUsers,
    updateUser,


}