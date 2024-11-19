import connectDB from "./db/index.js";
import dotenv from "dotenv"
import express from "express"

const app=express()


dotenv.config({
    path:'./env'
})




connectDB().then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`the server is running on port ${process.env.PORT}`);
    
  })  
}).catch((err)=>{
    console.log("MONGO-DB CONNECTION ERROR",err);
    
})