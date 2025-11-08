import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { WalletRoutes } from "../modules/wallet/wallet.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";


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
          {
    path:"/user/dashboard",
    route:DashboardRoutes,
   },
   
   
]


moduleRoutes.forEach((route)=>{
    router.use(route.path, route.route)
})