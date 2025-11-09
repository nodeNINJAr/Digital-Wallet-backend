import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkVerified } from "../../middlewares/checkVerifiedUser";
import { Role } from "../user/user.interface";
import { validationRequest } from "../../middlewares/validationReq";
import { recoveryPassZodSchema } from "./auth.validation";


const router = Router();


// 
router.post("/login", AuthControllers.credentialsLogin);
router.get("/verify", checkVerified(...Object.values(Role)), AuthControllers.verifyUser);
router.post("/refresh-token",checkVerified(...Object.values(Role)), AuthControllers.getNewAccessTokens);
router.post("/logout",checkVerified(...Object.values(Role)), AuthControllers.userLogOut);
router.post("/reset-password", validationRequest(recoveryPassZodSchema), checkVerified(...Object.values(Role)), AuthControllers.resetPassword);

export const AuthRoutes = router;