/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport from "passport"
import { User } from "../modules/user/user.model";
import { Strategy as localStrategy } from "passport-local";
import bcrypt from "bcryptjs";





// login with credientials
passport.use(
   new localStrategy({
      usernameField:"email",
      passwordField:"password",
   }, async(email:string, password:string, done)=>{

        try {
            // is user exist
            const isUserExist = await User.findOne({email});
        
            //  
              if (!isUserExist) {
                return done("User does not exist")
            }
           //   
            if(!isUserExist){
                 return done(null, false, {message:"User does not exist"})
            }  
 
          //   is passwordmatched
          const isPasswordMatched = await bcrypt.compare(password as string, isUserExist.password as string) 
           //password compare
           if(!isPasswordMatched){
             return done(null, false , {message:"password doesnt match"})
           } 
          
          return done(null,isUserExist)
           
       } catch (error) {
           console.log(error);
           done(error)
       }

   } 
))



// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user:any, done:(err:any, id?:unknown)=> void)=>{
     done(null, user._id)
}) 


// eslint-disable-next-line @typescript-eslint/no-unused-vars
passport.deserializeUser(async (id:string, done:any) => {
    
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (error) {
         console.log(error);
         done(error)
    }

})