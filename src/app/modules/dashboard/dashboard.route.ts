import { Router } from "express";
import { checkVerified } from "../../middlewares/checkVerifiedUser";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";


// 
const router = Router();

router.get("/stats",checkVerified(Role.USER), DashboardController.getUserDashboardStats);

export const DashboardRoutes = router;