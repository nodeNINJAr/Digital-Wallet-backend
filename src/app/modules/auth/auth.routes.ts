import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkVerified } from "../../middlewares/checkVerifiedUser";
import { Role } from "../user/user.interface";


const router = Router();


// 
router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessTokens);
router.post("/logout", AuthControllers.userLogOut);
router.post("/reset-password",checkVerified(...Object.values(Role)), AuthControllers.resetPassword);

export const AuthRoutes = router;