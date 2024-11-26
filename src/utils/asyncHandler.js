
//type 2:using promises
const asyncHandler =(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export{asyncHandler}

//type 1:using try catch
// const asyncHandler=(func)=>async(req,res,next)=>{
//     try {
//         await func(req,res,next)
        
//     } catch (error) {
//         res.status(404).json({
//             sucess:fail,
//             message:error.message

//         })
//     }
// }