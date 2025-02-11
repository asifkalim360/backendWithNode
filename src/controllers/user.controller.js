import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import JWT from "jsonwebtoken";

//-------------------CREATE ADDITIONAL FUNCTIONS-------------------------------------
//create function for generate the access-token and refresh-token 
const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //how to value add in a database object(user)
        user.refreshToken = refreshToken 
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh token and access token");
    }
}
//-----------------------------------------------------------------------------------


//-----------------------START REGISTER CONTROLLER ----------------------------------------------------
const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({message:"OK"});
    /* 
    //////// IMPORTANT WORK LIST IN THIS CONTROLLER ////////
    // (1) get user details from frontend 
    // (2) validation - not empty 
    // (3) check if user already exists: username, email 
    // (4) check for images, check for avatar 
    // (5) upload them to cloudinary, avatar 
    // (6) create user object - create entry in database(mongoDB) 
    // (7) remove password and refresh token field from response 
    // (8) check for user creation 
    // (9) return response 
    */

    // // CODE STARTED HERE!!!
    // STEP:(1) get user details from frontend 
    const {username, email, fullname, password} = req.body 
    console.log({email:email}); 
    //------------------------------------------------------------------------------------------

    // STEP:(2) validation - not empty 
    /*
    // // Single single sabko validate kar sakte hain.
    // if(username === "") {
    //     throw new ApiError(400, "username is required")
    // }
    // if(email === "") {
    //     throw new ApiError(400, "email is required")
    // }
    // if(fullname === "") {
    //     throw new ApiError(400, "FullName is required")
    // }
    // if(password === "") {
    //     throw new ApiError(400, "password is required")
    // }
    */ 

    // // sabko ek sat bhi validate kar sakte hain. // check kar rhe hain ki kisi ne empty string to pass nahi ki haina
    if([fullname, email, username, password].some((field) => field?.trim() ===""))    // All fields are check in a function
    {
        throw new ApiError(400, "All fields are required")
    }
    //------------------------------------------------------------------------------------------------------------------------

    // STEP:(3) check if user already exists: username, email 
    const existedUser = await  User.findOne({                       //check if username or email are exists!!!
        $or: [{username}, {email}]
    })

    if(existedUser) {       // agar existing username or email se registered koi karta hai to error dedo.
        throw new ApiError(409, "EMAIL or USERNAME  is already exists")
    }
    //-----------------------------------------------------------------------------------------------------------------------

    // STEP:(4) check for images, check for avatar 
    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;          // avatar image local server path
    console.log(avatarLocalPath)
    if(!avatarLocalPath) {                                  
             // check cover image is available or not if not available then through the error......
        throw new ApiError(400, "Avatar file not found")
    }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;  // coverImage image local server path()es code ko use karne se agar humlog cover image ka field blank rakhenge to error through krega(connot read properties of undefined (reading, '0'))
    // eslea humlog yahan pe es tarah se code ko likhenge......
    // let coverImageLocalPath; 
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }       
    
    //----------------------------------------------------------------------------------------------------------------------

    // STEP:(5) upload them to cloudinary, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(avatar);
    console.log(coverImage);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    
    // STEP:(6) create user object - create entry in database(mongoDB) 
    
    const user = await User.create({
        fullname, 
        email, 
        password, 
        username: username.toLowerCase(), 
        avatar: avatar.url, 
        coverImage: coverImage?.url || "",
    })
    // console.log(user);
    //--------------------------------------------------------------------------------------------------------------------------------

    // STEP:(7) remove password and refresh token field from response 
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // console.log(createdUser);
    //--------------------------------------------------------------------------------------------------------------------------------

    // STEP:(8) check for user creation 
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering  the user")
    }
    //-----------------------------------------------------------------------------------------------------------------

    // STEP:(9) return response 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully!!!")        // ek banaya hai humlogo ne (new ApiResponse)
    )
});
//-----------------------END REGISTER CONTROLLER ----------------------------------------------------


//-----------------------START LOGIN CONTROLLER ----------------------------------------------------
const loginUser = asyncHandler(async (req, res) => {
    //----------LOGIN TODO LIST --------------------
    /**
     * req.body -> data
     * username or email (access for)
     * find the user if you get then
     * password checking then 
     * generate the access-token and refresh-token and send to the user 
     * token sending with secured cookie
     * send response for login successfully
     */

    // STEP:(1) req.body -> data  (DATA GET TO req.body)
    const {username, email, password} = req.body; 
    // console.log(email);

    // STEP:(2) username or email (access for)
    // if (!username && !email) //jab dono se authenticate karna hoto.
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }


    // STEP:(3) find the user with(username or email). if you get user then check password. 
    const user = await User.findOne({ 
        $or:[{username}, {email}]
    }); 
    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    // STEP:(4) password checking and then. 
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential")
    }

    // STEP:(5) generate the access-token and refresh-token and send to the user)
    //sabse first me maine ek method banaya hai accessToken or refreshToken ka jiska use krenge yahan pe. 
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // STEP:(6) token sending with secured cookie 
    const options = {
        httpOnly: true, 
        secure: true,
    }

    return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {
                    user: loggedInUser, accessToken,refreshToken
                    },
                    "User logged In Successfully"
                )
            )



});
//-----------------------END LOGIN CONTROLLER ----------------------------------------------------


//-----------------------START LOGOUT CONTROLLER ----------------------------------------------------
const logoutUser = asyncHandler(async (req, res) => { 
    //step:1 -> how to delete refreshToken in database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },    
        {
            new:true    
        }
    )

    //Step:2  -> clear the all cookies....
    const options = {
        httpOnly: true, 
        secure: true
    }
    return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "user logged out"))

});
//-----------------------END LOGOUT CONTROLLER ------------------------------------------------------


//-----------------------START REFRESH TOKEN HANDLE CONTROLLER ----------------------------------------------------
const refreshAccessToken = asyncHandler(async (req, res) => { 
    //step:1 -> how to get refreshToken in cookies!!!
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        //Step:2  -> verify(decoded) the Refresh token with json web token(jwt)!!!
        const decodedToken = JWT.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        //After decoded the token. find the user with the help of (_id).
        const user = User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        
        //match the new generated refresh token and database refresh token token
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used ")
        }
    
        // after match the token generate the new token. 
        const options = {
            httpOnly: true, 
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id); 
        return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(
                        200, 
                        {accessToken  , refreshToken: newRefreshToken}, 
                        "Access token refreshed"
                    )
                )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

});
//-----------------------END refresh token handle CONTROLLER  ----------------------------------------------------

ApiResponse
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}
