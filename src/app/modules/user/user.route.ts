import { Router } from "express";
import { UserControllers } from "./user.controller";



const router = Router();





// **
router.post("/register", UserControllers.createUser);
router.patch("/:id", UserControllers.updateUser);

router.get("/", UserControllers.getAllUsers);



export const UserRoutes = router;