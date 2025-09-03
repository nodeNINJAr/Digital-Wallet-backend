import { checkVerified } from './../../middlewares/checkVerifiedUser';
import { Role } from '../user/user.interface';
import { TransactionController } from './transaction.controller';
import { Router } from "express";



// 
const router = Router();


// **wallet router **
router.post("/send",checkVerified(Role.USER), TransactionController.sendMoney);
router.post("/withdraw", TransactionController.withdraw);
router.post("/cash-in",checkVerified(Role.AGENT), TransactionController.cashIn);
router.get("/me",checkVerified(Role.AGENT,Role.AGENT), TransactionController.getMyTransactions);
router.get("/",checkVerified(Role.ADMIN), TransactionController.getAllTransactions); //only admin can access




export const TransactionRoutes = router;