import express, { Request, Response } from "express"
import httpStatus from "http-status-codes"
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFoundHandler";
import cookieParser from "cookie-parser";
import "./app/config/passport"
import passport from "passport";
import expressSession from "express-session"
import { envVars } from "./app/config/env";



const app = express();



// middleware
app.use(expressSession({
    secret:envVars.EXPRESS_SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser())


// base route
app.use("/api/v1/", router)







// 
app.get("/", (req: Request, res: Response) => {

    res.status(httpStatus.OK).json({
        message: "Welcome to Digital Wallet Backend"
    })
})




app.use(globalErrorHandler);
app.use(notFound);

// 
export default app;