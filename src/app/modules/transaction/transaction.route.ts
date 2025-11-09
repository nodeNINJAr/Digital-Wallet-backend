import { checkVerified } from './../../middlewares/checkVerifiedUser';
import { Role } from '../user/user.interface';
import { TransactionController } from './transaction.controller';
import { Router } from "express";



// 
const router = Router();


// **wallet router **
router.post("/send",checkVerified(Role.USER), TransactionController.sendMoney);
router.post("/cash-out",checkVerified(Role.USER), TransactionController.cashOut);
router.post("/cash-in",checkVerified(Role.AGENT), TransactionController.cashIn);
router.post("/withdraw",checkVerified(Role.AGENT), TransactionController.withdraw);
router.get("/all",checkVerified(...Object.values(Role)), TransactionController.getAllTransactions);






export const TransactionRoutes = router;