import { asyncHandler } from "../utils/AsyncHandler.js";
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../libs/token.js";
import IUser from "../types/schema/user.js";
import UserModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

const optAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
	const { accessToken } = req.cookies;

	if (!accessToken) {
		req.user = { role: "user" } as IUser;
		next();
	}

	const decoded = verifyAccessToken(accessToken);
	const user = await UserModel.findById(decoded.userId).select("-password").lean();
	if (!user) {
		throw new ApiError(401, "Unauthorized: User not found");
	}
	req.user = user as IUser;
	next();
});

export default optAuth;
