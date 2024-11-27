import connectDB from "./db/index.js";
import dotenv from "dotenv"
import cors from "cors"
import express from "express" 

//routes import
import userRouter from "./routes/user.routes.js"
//routes declaration


const app=express()
app.use(express.json())
app.use("/api/v1/users", userRouter)
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(express.json({limit:"15kb"}))
dotenv.config({
   path:'./env'
})
console.log("Inside of index.js file");
app.use(cors({
   origin:process.env.CORS_ORIGIN,
   credentials:true,
}))
console.log("Inside of the app.js")
app.use((req, res, next) => {
   res.status(404).send({ error: 'Route not found' });
});
// app.listen(8000,()=>{
//    console.log("server is running on port 8000")
// }
// )
connectDB().then(()=>{
 app.listen(process.env.PORT ,()=>{
   console.log(`the server is running on port ${process.env.PORT}`);
  
 }) 
}).catch((err)=>{
   console.log("MONGO-DB CONNECTION ERROR",err);
  
})


