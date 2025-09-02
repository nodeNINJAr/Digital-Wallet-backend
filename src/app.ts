import express, { Request, Response } from "express"
import httpStatus from "http-status-codes"
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFoundHandler";



const app = express();



// middleware
app.use(express.json());


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