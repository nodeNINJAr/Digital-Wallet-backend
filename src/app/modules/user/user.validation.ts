import { z } from "zod";
import { AgentStatus, IsActive, Role } from "./user.interface";


//Create Zod schema
export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),

 email: z
    .string({ invalid_type_error: "Email must be a string" })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" })
    .refine(
      (val) => val.endsWith("@gmail.com") || val.endsWith("@yahoo.com"), 
      { message: "Email must be a Gmail or Yahoo address" } // optional: restrict domain
    ),
  
    phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+880\d{9}$/.test(val), {
        message: "Phone must be a valid Bangladeshi number starting with +880",
    }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  
  picture: z.string().url().optional(),

  role: z.enum(Object.values(Role) as string[]).optional(),

  isActive: z.enum(Object.values(IsActive) as string[]).optional(),

  isVerified: z.boolean().optional(),

  agentStatus: z.enum(Object.values(AgentStatus) as string[]).optional(),
});




// update zod schema

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .optional(),
  
    phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+880\d{9}$/.test(val), {
        message: "Phone must be a valid Bangladeshi number starting with +880",
    }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .optional(),
  
  picture: z.string().url().optional(),


});