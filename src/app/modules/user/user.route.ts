import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkVerified } from "../../middlewares/checkVerifiedUser";
import { Role } from "./user.interface";
import { validationRequest } from "../../middlewares/validationReq";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";



const router = Router();




// **user router **
router.post("/register",validationRequest(createUserZodSchema), UserControllers.createUser);
router.patch("/update/:id",checkVerified(...Object.values(Role)),validationRequest(updateUserZodSchema), UserControllers.updateUser);
router.get("/", UserControllers.getAllUsers);
router.patch("/agent/apply",checkVerified(Role.USER), UserControllers.agentStatusUpdate);
// **







export const UserRoutes = router;