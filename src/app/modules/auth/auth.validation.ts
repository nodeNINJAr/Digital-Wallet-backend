import {z} from "zod";


export const recoveryPassZodSchema = z.object({
  oldPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
  
});