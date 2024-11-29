import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAcessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const acessToken = user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()

        user.refreshToken=refreshToken

        await user.save({ validateBeforeSave:false })

        return {refreshToken,acessToken}
        
    } catch (error) {
        throw new ApiError(500," something went wrong while generating refresh and acess token");
    }
}

const registerUser=asyncHandler( async (req,res)=>{
    
       //get users detail
       //validation :non empty
       //check if user already exist:username and email
       //check for images and avtar
       //upload them on clodinary,avtar
       //create user obj-create entry in db 
       //remove password and refresh token field from user
       //check for user creation
       //return response ow error
    console.log("in user controller");
  
       const {username,fullname, email,password } = req.body;// Destructure 'email' from req.body
       console.log("email", email);

       //beginner level checking
    //    if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    //    }

    if (
        [fullname,username,email,password].some((field)=>
        field?.trim() ==="")
    ) {
        throw new ApiError(400,"All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }
    // console.log(req.files)
    const avatarLocalPath= req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
        const avatar= await uploadOnCloudinary(avatarLocalPath)

        const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }

    const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    email,
    password,
    username:username.toLowerCase()
   })
      
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"wrong when registering the user")
    }

    return res.status(200).json(
        new ApiResponse(200,createdUser," user registered sucessfully")
    )
    
   
})

const loginUser =asyncHandler(async(req,res)=>{
    //todos 
    //1.req body data
    //2.username or email based
    //3.find the user
    //4.compare password
    //5.acess and generate token
    //6.send cookies
    const { email,username,password }=req.body

    if (!username || !password) {
        throw new ApiError(400," username or password required!! ")
        
    }
       const user = await User.findOne({
        $or :[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }
      const isPasswordValid=  await user.isPasswordCorrect(password)
      if(!isPasswordValid){
        throw new ApiError(401,"invalid user credentials ! ")
    }
       const {acessToken,refreshToken} =  await generateAcessAndRefreshToken(user._id)

       const loggedInUser = await User.findById(user._id).
       select("-password -refreshToken")

       const options = {
            httpOnly:true,
            secure:true

       }
       return res
       .status(200)
       .cookie("acessToken",acessToken,options)
       .cookie(" refreshToken ",refreshToken,options)
       .json(
            new ApiResponse(200,
                {
                    user:loggedInUser,acessToken,refreshToken
                },
                " user logged in sucessfully !!"
            )
       )

       const logoutUser = asyncHandler(async(req,res)=>{
       await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new:true
            }
        )
        const options = {
            httpOnly:true,
            secure:true

       }
       return res.status(200).clearCookie("acessToken",options).
       clearCookie("refreshToken",options).
       json(new ApiResponse(200,{},"user looged out !!"))
       })


})

export {registerUser,
    loginUser,
    logoutUser
}