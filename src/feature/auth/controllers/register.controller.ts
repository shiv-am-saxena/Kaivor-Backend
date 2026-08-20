import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { env } from "../../../config/index.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
	generateAccessToken,
	generateRefreshToken,
	generateResetPasswordToken,
	verifyResetPasswordToken
} from "../../../libs/token.js";
import UserModel from "../../../models/user.model.js";
import { sendVerificationEmail } from "../services/email.js";
import redisClient from "../../../services/redisInit.js";
import { hashPassword } from "../services/bcrypt.js";
import IUser from "../../../types/schema/user.js";

// Controller for handling user registration and email verification
export const registerWithGoogle = asyncHandler(async (req: Request, res: Response) => {
	await passport.authenticate("google-signup", { scope: ["profile", "email"] })(req, res);
});
// Controller for handling the callback from Google after user authentication
export const googleCallback = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		await passport.authenticate(
			"google-signup",
			{ session: false },
			async (err: any, user: any, info: any) => {
				if (err) {
					return next(new ApiError(500, "Google authentication failed", err));
				}
				if (!user) {
					const errorMessage = encodeURIComponent(
						info?.message || "Google authentication failed"
					);
					return res.redirect(`${env.CORS_ORIGIN}/auth/register?error=${errorMessage}`); // User not found or authentication failed
				}
				const accessToken = generateAccessToken({ _id: user._id, email: user.email });
				const refreshToken = generateRefreshToken({ _id: user._id, email: user.email });

				await UserModel.findByIdAndUpdate(
					user._id,
					{ refreshToken },
					{ new: true }
				);

				res.cookie("refreshToken", refreshToken, {
					httpOnly: true,
					secure: env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: 24 * 60 * 60 * 1000 // 1 day
				});
				res.cookie("accessToken", accessToken, {
					httpOnly: true,
					secure: env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: 60 * 60 * 1000 // 60 minutes
				});

				const redirectUrl = `${env.CORS_ORIGIN}/auth/callback?token=${accessToken}`; // Redirect to the frontend with the token as a query parameter
				return res.redirect(redirectUrl);
			}
		)(req, res, next);
	}
);

// Controller for handling user registration with email and password
export const registerWithEmail = asyncHandler(async (req: Request, res: Response) => {
	const { fullName, email, password, phoneNumber } = req.body;
	if (
		[fullName, email, password, phoneNumber].some(
			(field) =>
				typeof field === "undefined" || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
	const existingUser = await UserModel.findOne({ email });
	if (existingUser) {
		throw new ApiError(409, "Email is already registered");
	}
	const existingPhoneNumber = await UserModel.findOne({ phoneNumber });
	if (existingPhoneNumber) {
		throw new ApiError(409, "Phone number is already registered");
	}
	const hashedPassword = await hashPassword(password); // Hash the password before saving it to the database
	const newUser = await UserModel.create({
		fullName,
		email,
		password: hashedPassword,
		phoneNumber
	});

	const verificationToken = generateResetPasswordToken({ id: newUser._id, email: newUser.email }); // Generate a verification token for email verification
	const mail = await sendVerificationEmail(newUser.email, verificationToken); // Send the verification email to the user
	if (!mail) {
		throw new ApiError(503, "Failed to send verification email");
	}
	res.status(200).json(
		new ApiResponse(
			200,
			null,
			"Registration successful. Please check your email for verification."
		)
	);
});

// Controller for handling email verification
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
	const { token } = req.query;
	if (!token || typeof token !== "string") {
		throw new ApiError(400, "Verification token is required");
	}
	const decodedToken = verifyResetPasswordToken(token); // Verify the token and extract the user ID and email from it
	const redisKey = `verificationToken:${decodedToken.id}`; // Create a Redis key for the verification token using the user ID
	const tokenExistsInRedis = await redisClient.get(redisKey); // Check if the token exists in Redis (to ensure it hasn't expired or been used)
	if (tokenExistsInRedis) {
		// Check if the token exists in Redis (to ensure it hasn't expired or been used)
		throw new ApiError(400, "Verification token has expired used or is invalid");
	}
	if (!decodedToken) {
		throw new ApiError(400, "Invalid or expired verification token"); // If the token is invalid or expired, throw an error
	}

	const user = await UserModel.findByIdAndUpdate(
		decodedToken.id,
		{
			isVerified: {
				email: true
			}
		},
		{ new: true }
	); // Update the user's email verification status in the database
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	await redisClient.setex(redisKey, 3600, "verified"); // Invalidate the token from Redis after successful verification

	res.status(200).json(
		new ApiResponse(
			200,
			null,
			"Email verified successfully. You can now log in to your account."
		)
	);
});

// Controller for deleting a user account
export const deleteUserAccount = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user as IUser; // Get the authenticated user from the request object (set by the isLoggedIn middleware)
	if (!_id) {
		throw new ApiError(401, "You are not logged in. Please log in to access this resource.");
	}
	const deletedUser = await UserModel.findByIdAndDelete({ _id }); // Delete the user account from the database
	if (!deletedUser) {
		throw new ApiError(404, "User not found");
	}
	res.status(200).json(new ApiResponse(200, null, "User account deleted successfully."));
});
