import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import JWT from "jsonwebtoken";


 export const verifyJWT = asyncHandler( async(req, res,next) => {
    try {
        // how to get token access in this area !!!
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ", "");
        if(!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        // jwt ko verify karwana hoga yahan pe.
        const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET) 
    
        //REQUESTING FOR DATABASE 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user) {
            // NEXT-VIDEO : discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
    
        }
    
        // sab check hone ke baad agar user hai to we can do this 
        //req.user me hhumlog user(any name) ko kisi bhi name se le sakte hain.....
        req.user = user 
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})


 