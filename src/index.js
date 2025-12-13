import dotenv from "dotenv";
dotenv.config({path:"./.env"});
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("Error in starting the application", err);
});









































// import express from "express";
// const app=express();
// ;(async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
//         app.on("error",(error)=>{
//             console.error("Error connecting to the database", error);
//             throw error;
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     }catch(err){
//         console.error("Error connecting to the database", err);
//         throw err;
//     }
// })()