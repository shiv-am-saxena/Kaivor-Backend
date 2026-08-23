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
	verifyRefreshToken,
	verifyResetPasswordToken
} from "../../../libs/token.js";
import UserModel from "../../../models/user.model.js";
import { sendResetPasswordEmail, sendVerificationEmail } from "../../../libs/email.js";
import redisClient from "../../../services/redisInit.js";
import { comparePassword, hashPassword } from "../services/bcrypt.js";
import IUser from "../../../types/schema/user.js";

// Controller for handling user login using google authentication
export const loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
	await passport.authenticate("google-signin", { scope: ["profile", "email"] })(req, res);
});

// Controller for handling the callback from Google after user authentication
export const googleLoginCallback = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		await passport.authenticate(
			"google-signin",
			{ session: false },
			async (err: any, user: any, info: any) => {
				if (err) {
					return next(new ApiError(500, "Google authentication failed", err)); // Authentication error
				}
				if (!user) {
					const errorMessage = encodeURIComponent(
						info?.message || "Google authentication failed"
					);
					return res.redirect(`${env.CORS_ORIGIN}/auth/login?error=${errorMessage}`); // User not found or authentication failed
				}
				const accessToken = generateAccessToken({ _id: user._id, email: user.email });
				const refreshToken = generateRefreshToken({ _id: user._id, email: user.email });

				await UserModel.findByIdAndUpdate(
					user._id,
					{ refreshToken },
					{ returnDocument: "after" }
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

				const redirectUrl = `${env.CORS_ORIGIN}/auth/callback`; // Redirect to the frontend with the token as a query parameter
				return res.redirect(redirectUrl);
			}
		)(req, res, next);
	}
);

// Controller for handling user login with email and password
export const loginWithEmail = asyncHandler(async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (
		[email, password].some(
			(field) =>
				typeof field === "undefined" || (typeof field === "string" && field.trim() === "")
		)
	) {
		throw new ApiError(400, "All fields are required");
	}
	const user = await UserModel.findOne({ email });
	if (!user) {
		throw new ApiError(409, "Try registering with this email");
	}
	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid password");
	}
	if (!user.isVerified.email) {
		throw new ApiError(
			403,
			"Email is not verified. Please verify your email before logging in."
		);
	}
	const accessToken = generateAccessToken({ _id: user._id, email: user.email });
	const refreshToken = generateRefreshToken({ _id: user._id, email: user.email });
	const newUser = await UserModel.findByIdAndUpdate(
		user._id,
		{ refreshToken },
		{ returnDocument: "after" }
	);
	if (!newUser) {
		throw new ApiError(404, "User not found");
	}
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 24 * 60 * 60 * 1000 // 1 days
	});
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 1000 // 60 minutes
	});
	res.status(200).json(new ApiResponse(200, user, "Login successful."));
});

// Controller for resending the verification email
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email || typeof email !== "string") {
		throw new ApiError(400, "Email is required");
	}
	const user = await UserModel.findOne({ email });
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	if (user.isVerified.email) {
		throw new ApiError(400, "Email is already verified");
	}
	const verificationToken = generateResetPasswordToken({ id: user._id, email: user.email });
	const mail = await sendVerificationEmail(user.email, verificationToken);
	if (!mail) {
		throw new ApiError(503, "Failed to send verification email");
	}
	res.status(200).json(
		new ApiResponse(
			200,
			null,
			"Verification email resent successfully. Please check your email."
		)
	);
});
// Controller for handling user logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
	const { refreshToken, accessToken } = req.cookies;
	if (!refreshToken || !accessToken) {
		throw new ApiError(400, "Refresh token and access token are required for logout");
	}
	await redisClient.setex(`refreshToken:${refreshToken}`, 3600, "invalidated");
	await redisClient.setex(`accessToken:${accessToken}`, 3600, "invalidated"); // Invalidate the refresh token in Redis
	res.clearCookie("refreshToken");
	res.clearCookie("accessToken");
	res.status(200).json(new ApiResponse(200, null, "Logout successful."));
});
// Controller for regenerating access token using refresh token
export const regenAccessToken = asyncHandler(async (req: Request, res: Response) => {
	const { refreshToken } = req.cookies;
	if (!refreshToken) {
		throw new ApiError(400, "Refresh token is required");
	}
	const decodedToken = verifyRefreshToken(refreshToken);
	if (!decodedToken) {
		throw new ApiError(401, "Invalid or expired refresh token");
	}
	const user = await UserModel.findById(decodedToken._id).select("+refreshToken");
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	if (user.refreshToken !== refreshToken as string) {
		throw new ApiError(401, "Refresh token does not match");
	}
	const newAccessToken = generateAccessToken({ _id: user._id, email: user.email });
	if (!newAccessToken) {
		throw new ApiError(500, "Failed to generate new access token");
	}
	res.cookie("accessToken", newAccessToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 1000 // 60 minutes
	});
	res.status(200).json(
		new ApiResponse(
			200,
			{ accessToken: newAccessToken },
			"Access token refreshed successfully."
		)
	);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email || typeof email !== "string") {
		throw new ApiError(400, "Email is required");
	}
	const user = await UserModel.findOne({ email });
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	const resetToken = generateResetPasswordToken({ id: user._id, email: user.email });
	const mail = await sendResetPasswordEmail(user.email, resetToken);
	if (!mail) {
		throw new ApiError(503, "Failed to send password reset email");
	}
	res.status(200).json(
		new ApiResponse(
			200,
			null,
			"Password reset email sent successfully. Please check your email."
		)
	);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
	const { token } = req.query;
	const { newPassword, cnfNewPassword } = req.body;
	if (!token || typeof token !== "string") {
		throw new ApiError(400, "Reset token is required");
	}
	if (
		!newPassword ||
		!cnfNewPassword ||
		typeof newPassword !== "string" ||
		typeof cnfNewPassword !== "string"
	) {
		throw new ApiError(400, "New password and confirm new password are required");
	}
	if (newPassword !== cnfNewPassword) {
		throw new ApiError(400, "Passwords do not match");
	}
	const tokenExistInRedis = await redisClient.exists(`resetPasswordToken:${token}`); // Check if the reset token exists in Redis
	if (tokenExistInRedis) {
		throw new ApiError(401, "Reset token has already been used or is invalid");
	}
	const decodedToken = verifyResetPasswordToken(token);
	if (!decodedToken) {
		throw new ApiError(401, "Invalid or expired reset token");
	}
	const ack = await redisClient.setex(`resetPasswordToken:${token}`, 3600, "used"); // Invalidate the reset token in Redis
	if (!ack) {
		throw new ApiError(500, "Failed to invalidate reset token");
	}
	const hashedPassword = await hashPassword(newPassword); // Hash the new password before saving it to the database
	const user = await UserModel.findByIdAndUpdate(
		decodedToken.id,
		{ password: hashedPassword },
		{ new: true }
	);
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	res.status(200).json(new ApiResponse(200, null, "Password reset successful."));
});
//profile controller
export const profile = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user as IUser;
	const user = await UserModel.findById(_id);
	if (!user) {
		throw new ApiError(500, "Failed to fetch user");
	}
	res.status(200).json(new ApiResponse(200, user, "Profile fetched successfully."));
});
