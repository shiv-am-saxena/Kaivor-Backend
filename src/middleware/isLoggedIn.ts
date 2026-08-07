import { asyncHandler } from "../utils/AsyncHandler.js";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../libs/token.js";
import UserModel from "../models/user.model.js";
import logger from "../libs/logger.js";

// Middleware to check if the user is logged in by verifying the access token
export const isLoggedIn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    logger.info(req.cookies); // Log the cookies for debugging purposes
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.accessToken; // Extract the token from the Authorization header
    logger.info(token); // Log the token for debugging purposes
    if (!token) {
        throw new ApiError(401, "You are not logged in. Please log in to access this resource.");
    }

    const decoded = verifyAccessToken(token); // Verify the access token
    if (!decoded) {
        throw new ApiError(401, "Invalid or expired token. Please log in again.");
    }

    const user = await UserModel.findById(decoded._id); // Find the user by ID from the decoded token
    if (!user) {
        throw new ApiError(404, "User not found. Please log in again.");
    }

    req.user = user; // Attach the user object to the request for further use
    next(); // Proceed to the next middleware or route handler
});
