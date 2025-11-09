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
router.get("/all",checkVerified(Role.ADMIN), UserControllers.getTransactionsWithUserAndWallet);
router.get("/agents",checkVerified(Role.USER, Role.ADMIN), UserControllers.getAllAgents);
// 
router.get("/",checkVerified(Role.AGENT), UserControllers.getAllusersAg);
router.patch("/agent/apply",checkVerified(Role.USER), UserControllers.agentStatusUpdate);
// **







export const UserRoutes = router;