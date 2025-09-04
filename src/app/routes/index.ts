import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { WalletRoutes } from "../modules/wallet/wallet.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";


export const router = Router();

const moduleRoutes = [
    {
        path:"/user",
        route:UserRoutes,
    },
    {
        path:"/auth",
        route:AuthRoutes,
    },
    {
    path:"/wallets",
    route:WalletRoutes,
   },
       {
    path:"/transactions",
    route:TransactionRoutes,
   },
   
   
]


moduleRoutes.forEach((route)=>{
    router.use(route.path, route.route)
})