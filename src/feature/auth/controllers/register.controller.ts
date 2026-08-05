import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import passport from "passport";
import { env } from "../../../config/index.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { generateToken } from "../../../libs/jwt.js";
import UserModel from "../../../models/user.model.js";

export const registerWithGoogle = asyncHandler(async (req: Request, res: Response) => {
	await passport.authenticate("google-signup", { scope: ["profile", "email"] })(req, res);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
	await passport.authenticate(
		"google-signup",
		{ session: false },
		(err: any, user: any, info: any) => {
			if (err) {
				throw new ApiError(500, "Google authentication failed", err); // Authentication error
			}
			if (!user) {
				const errorMessage = encodeURIComponent(
					info?.message || "Google authentication failed"
				);
				return res.redirect(`${env.CORS_ORIGIN}/auth/register?error=${errorMessage}`); // User not found or authentication failed
			}
			const token = generateToken({ _id: user._id, email: user.email }); // Generate JWT token for the authenticated user
			const redirectUrl = `${env.CORS_ORIGIN}/auth/register?token=${token}`; // Redirect to the frontend with the token as a query parameter
			return res.redirect(redirectUrl);
		}
	)(req, res);
});

export const registerWithEmail = asyncHandler(async (req: Request, res: Response) => {
	const { name, email, password, phone } = req.body;
	if (
		[name, email, password, phone].some(
			(field) =>
				typeof field === "undefined" || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "Email is already registered");
    }
	res.status(200).json(new ApiResponse(200, null, "Registration successful. Please check your email for verification."));
});
