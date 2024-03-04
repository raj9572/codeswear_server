import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ErrorResponse } from "../utils/ApiResponse.js";



export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json(ErrorResponse(401, "Unauthorized request"))
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if (!user) {
            // Todo: discuss about frontend
            throw new ApiError(401, "invalid Access Token")
        }


        req.user = user

        next()
    } catch (error) {
        return res.status(ErrorResponse(401,error?.message || "Invalid Access Token"))
    }

}



export const fetchAdminAccess = (roles = [])=>{
    return function(req,res,next){
        if(!req.user){
            return res.status(401).json(ErrorResponse(401,"Invalid access token"))
        }
        if(!roles.includes(req.user.isAdmin)){
            return res.status(400).json(ErrorResponse(400,"you are not authenticated"))
        }
        next()
    }
}
