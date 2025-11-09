import { Router } from "express";
import { checkVerified } from "../../middlewares/checkVerifiedUser";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";


// 
const router = Router();

router.get("/user",checkVerified(Role.USER), DashboardController.getUserDashboardStats);
router.get("/agent",checkVerified(Role.AGENT), DashboardController.getAgentDashboardStats);
router.get("/admin",checkVerified(Role.ADMIN), DashboardController.getDashboardStats);
router.get("/admin/transaction-trends",checkVerified(Role.ADMIN), DashboardController.getTransactionTrends);
router.get("/admin/transaction-types",checkVerified(Role.ADMIN), DashboardController.getTransactionTypes);
router.get("/admin/recent-activity",checkVerified(Role.ADMIN), DashboardController.getRecentActivity);

export const DashboardRoutes = router;