import { Role } from './../user/user.interface';
import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkVerified } from "../../middlewares/checkVerifiedUser";




const router = Router();


// **wallet router **
router.get("/me", checkVerified(Role.AGENT, Role.USER), WalletController.getWallet);
router.patch("/block/:id",checkVerified(Role.ADMIN, Role.USER), WalletController.updateWalletStatus);
router.patch("/agents/:id/approve",checkVerified(Role.ADMIN, Role.USER), WalletController.updateWalletType);



export const WalletRoutes = router;