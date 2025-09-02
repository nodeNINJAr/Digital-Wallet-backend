import { Router } from "express";
import { UserControllers } from "./user.controller";



const router = Router();




// **user router **
router.post("/register", UserControllers.createUser);
router.patch("/:id", UserControllers.updateUser);

router.get("/", UserControllers.getAllUsers);
// **







export const UserRoutes = router;