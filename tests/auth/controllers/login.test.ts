import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { describe, it, expect, jest, beforeEach, beforeAll, afterEach } from "@jest/globals";
import { env } from "../../../src/config/index.js";

jest.unstable_mockModule("../../../src/libs/token.js", () => ({
	generateAccessToken: jest.fn(),
	generateRefreshToken: jest.fn(),
	generateResetPasswordToken: jest.fn(),
	verifyRefreshToken: jest.fn(),
	verifyResetPasswordToken: jest.fn()
}));

jest.unstable_mockModule("../../../src/libs/email.js", () => ({
	sendVerificationEmail: jest.fn(),
	sendResetPasswordEmail: jest.fn()
}));

jest.unstable_mockModule("../../../src/feature/auth/services/bcrypt.js", () => ({
	hashPassword: jest.fn(),
	comparePassword: jest.fn()
}));

jest.unstable_mockModule("../../../src/models/user.model.js", () => ({
	default: {
		findOne: jest.fn(),
		findById: jest.fn(),
		findByIdAndUpdate: jest.fn()
	}
}));

jest.unstable_mockModule("../../../src/services/redisInit.js", () => ({
	default: {
		exists: jest.fn(),
		setex: jest.fn()
	}
}));

describe("Auth Controllers", () => {
	let authController: any;
	let UserModel: any;
	let redisClient: any;
	let tokenUtils: any;
	let emailService: any;
	let bcryptService: any;

	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: jest.Mock;

	const mockRequest = () => {
		const request = {} as Partial<Request>;
		request.body = {};
		request.query = {};
		request.cookies = {};
		return request;
	};

	const mockResponse = () => {
		const response = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
			cookie: jest.fn().mockReturnThis(),
			clearCookie: jest.fn().mockReturnThis(),
			redirect: jest.fn().mockReturnThis()
		};
		return response as Partial<Response>;
	};

	beforeAll(async () => {
		tokenUtils = await import("../../../src/libs/token.js");
		emailService = await import("../../../src/libs/email.js");
		bcryptService = await import("../../../src/feature/auth/services/bcrypt.js");
		UserModel = (await import("../../../src/models/user.model.js")).default;
		redisClient = (await import("../../../src/services/redisInit.js")).default;
		authController = await import("../../../src/feature/auth/controllers/login.controller.js");
	});

	beforeEach(() => {
		jest.clearAllMocks();
		req = mockRequest();
		res = mockResponse();
		next = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("loginWithGoogle", () => {
		it("should call passport.authenticate with google-signin", async () => {
			const authMock = jest.fn();
			jest.spyOn(passport, "authenticate").mockReturnValue(authMock as any);

			await authController.loginWithGoogle(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(passport.authenticate).toHaveBeenCalledWith("google-signin", {
				scope: ["profile", "email"]
			});
			expect(authMock).toHaveBeenCalledWith(req, res);
		});
	});

	describe("googleLoginCallback", () => {
		it("should pass 500 error to next if google authentication fails", async () => {
			jest.spyOn(passport, "authenticate").mockImplementation(((
				strategy: any,
				options: any,
				cb: any
			) => {
				return () => cb(new Error("Passport Error"), null, null);
			}) as any);

			await authController.googleLoginCallback(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 500,
					message: "Google authentication failed"
				})
			);
		});

		it("should redirect to login with error message if user not found", async () => {
			jest.spyOn(passport, "authenticate").mockImplementation(((
				strategy: any,
				options: any,
				cb: any
			) => {
				return () => cb(null, false, { message: "Not found" });
			}) as any);

			await authController.googleLoginCallback(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(res.redirect).toHaveBeenCalledWith(
				`${env.CORS_ORIGIN}/auth/login?error=Not%20found`
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should generate token and redirect to callback on success", async () => {
			const mockUser = { _id: "user123", email: "test@test.com" };
			jest.spyOn(passport, "authenticate").mockImplementation(((
				strategy: any,
				options: any,
				cb: any
			) => {
				return () => cb(null, mockUser, null);
			}) as any);
			tokenUtils.generateAccessToken.mockReturnValue("mockAccessToken");

			await authController.googleLoginCallback(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(tokenUtils.generateAccessToken).toHaveBeenCalledWith(mockUser);
			expect(res.redirect).toHaveBeenCalledWith(`${env.CORS_ORIGIN}/auth/callback`);
		});
	});

	describe("loginWithEmail", () => {
		beforeEach(() => {
			req.body = { email: "test@test.com", password: "password123" };
		});

		it("should pass 400 if fields are missing", async () => {
			req.body.email = "";

			await authController.loginWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400,
					message: "All fields are required"
				})
			);
		});

		it("should pass 409 if user does not exist", async () => {
			UserModel.findOne.mockResolvedValue(null);

			await authController.loginWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 409,
					message: "Try registering with this email"
				})
			);
		});

		it("should pass 401 if password is invalid", async () => {
			UserModel.findOne.mockResolvedValue({ password: "hashedPassword" });
			bcryptService.comparePassword.mockResolvedValue(false);

			await authController.loginWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: "Invalid password"
				})
			);
		});

		it("should pass 403 if email is not verified", async () => {
			UserModel.findOne.mockResolvedValue({
				password: "hashedPassword",
				isVerified: { email: false }
			});
			bcryptService.comparePassword.mockResolvedValue(true);

			await authController.loginWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 403,
					message: "Email is not verified. Please verify your email before logging in."
				})
			);
		});

		it("should log in, set cookies, and return user data on success", async () => {
			const mockUser = {
				_id: "user123",
				email: "test@test.com",
				password: "hashedPassword",
				isVerified: { email: true }
			};

			UserModel.findOne.mockResolvedValue(mockUser);
			bcryptService.comparePassword.mockResolvedValue(true);
			tokenUtils.generateAccessToken.mockReturnValue("access123");
			tokenUtils.generateRefreshToken.mockReturnValue("refresh123");
			UserModel.findByIdAndUpdate.mockResolvedValue({
				...mockUser,
				refreshToken: "refresh123"
			});

			await authController.loginWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(res.cookie).toHaveBeenCalledTimes(2);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 200,
					message: "Login successful."
				})
			);
		});
	});

	describe("resendVerificationEmail", () => {
		beforeEach(() => {
			req.body = { email: "test@test.com" };
		});

		it("should pass 400 if email is missing", async () => {
			req.body.email = undefined;

			await authController.resendVerificationEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400,
					message: "Email is required"
				})
			);
		});

		it("should pass 404 if user not found", async () => {
			UserModel.findOne.mockResolvedValue(null);

			await authController.resendVerificationEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 404,
					message: "User not found"
				})
			);
		});

		it("should pass 400 if email is already verified", async () => {
			UserModel.findOne.mockResolvedValue({ isVerified: { email: true } });

			await authController.resendVerificationEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400,
					message: "Email is already verified"
				})
			);
		});

		it("should resend verification email on success", async () => {
			const mockUser = {
				_id: "user123",
				email: "test@test.com",
				isVerified: { email: false }
			};
			UserModel.findOne.mockResolvedValue(mockUser);
			tokenUtils.generateResetPasswordToken.mockReturnValue("newToken");
			emailService.sendVerificationEmail.mockResolvedValue(true);

			await authController.resendVerificationEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
				mockUser.email,
				"newToken"
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("logout", () => {
		it("should pass 400 if tokens are missing in cookies", async () => {
			req.cookies = {};

			await authController.logout(req as Request, res as Response, next as NextFunction);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400,
					message: "Refresh token and access token are required for logout"
				})
			);
		});

		it("should clear cookies and invalidate tokens in Redis", async () => {
			req.cookies = { refreshToken: "refresh123", accessToken: "access123" };
			redisClient.setex.mockResolvedValue("OK");

			await authController.logout(req as Request, res as Response, next as NextFunction);

			expect(redisClient.setex).toHaveBeenCalledWith(
				"refreshToken:refresh123",
				3600,
				"invalidated"
			);
			expect(redisClient.setex).toHaveBeenCalledWith(
				"accessToken:access123",
				3600,
				"invalidated"
			);
			expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
			expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});

	describe("regenAccessToken", () => {
		beforeEach(() => {
			req.cookies = { refreshToken: "refresh123" };
		});

		it("should pass 400 if refresh token is missing", async () => {
			req.cookies = {};

			await authController.regenAccessToken(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400,
					message: "Refresh token is required"
				})
			);
		});

		it("should pass 401 if refresh token is invalid", async () => {
			tokenUtils.verifyRefreshToken.mockReturnValue(null);

			await authController.regenAccessToken(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: "Invalid or expired refresh token"
				})
			);
		});

		it("should pass 401 if refresh token does not match DB", async () => {
			tokenUtils.verifyRefreshToken.mockReturnValue({ id: "user123" });
			UserModel.findById.mockReturnValue({
				select: jest.fn().mockResolvedValue({
					_id: "user123",
					refreshToken: "differentToken"
				})
			});

			await authController.regenAccessToken(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
					message: "Refresh token does not match"
				})
			);
		});

		it("should generate new access token on success", async () => {
			tokenUtils.verifyRefreshToken.mockReturnValue({ id: "user123" });
			UserModel.findById.mockReturnValue({
				select: jest.fn().mockResolvedValue({
					_id: "user123",
					email: "test@test.com",
					refreshToken: "refresh123"
				})
			});
			tokenUtils.generateAccessToken.mockReturnValue("newAccess123");

			await authController.regenAccessToken(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(res.cookie).toHaveBeenCalledWith(
				"accessToken",
				"newAccess123",
				expect.any(Object)
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 200,
					data: { accessToken: "newAccess123" }
				})
			);
		});
	});
});
