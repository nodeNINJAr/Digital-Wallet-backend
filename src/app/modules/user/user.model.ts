import { model, Schema } from "mongoose"
import { AgentStatus, IsActive, IUser, Role } from "./user.interface"



// 
const userSchema = new Schema<IUser>({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String},
    role:{
        type:String,
        enum:Object.values(Role),
        default:Role.USER,
    },
    phone:{type:String},
    picture:{type:String,},
    isActive:{
        type:String,
        enum:Object.values(IsActive),
        default:IsActive.ACTIVE,
    },
    isVerified:{type:Boolean, default:false},
    agentStatus:{
         type:String,
         enum:Object.values(AgentStatus),
         default:AgentStatus.INITIAL,
    }
  
},

{
timestamps:true,
versionKey:false,  

})


export const User = model<IUser>("User", userSchema)