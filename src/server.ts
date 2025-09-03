/* eslint-disable no-console */
import {Server} from "http"
import mongoose from "mongoose"
import app from "./app";
import { envVars } from "./app/config/env";
import { seedAdmin } from "./app/utils/seedAdmin";






//
let server:Server


const startServer = async()=>{
   try {
      await mongoose.connect(envVars.MONGODB_URL as string);
      console.log("Connected to MongoDB");
   
    //   
    server = app.listen(envVars.PORT,()=>{
        console.log(`Server is listening to port ${envVars.PORT}`);
    })
   } catch (error) {
      console.log(error);
   }
}


// start server and seed sdmin
(async()=>{
    await startServer();
    await seedAdmin(); 
})()




// Server error handle
process.on("SIGTERM", () => {
    console.log("SIGTERM signal recieved... Server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

process.on("SIGINT", () => {
    console.log("SIGINT signal recieved... Server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})


process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejecttion detected... Server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected... Server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });
    }

    process.exit(1)
})



