import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkVerified } from "../../middlewares/checkVerifiedUser";
import { Role } from "./user.interface";



const router = Router();




// **user router **
router.post("/register", UserControllers.createUser);
router.patch("/update/:id",checkVerified(Role.AGENT, Role.USER), UserControllers.updateUser);
router.get("/",checkVerified(Role.ADMIN), UserControllers.getAllUsers);
router.patch("/agent/apply",checkVerified(Role.USER), UserControllers.agentStatusUpdate);
// **







export const UserRoutes = router;