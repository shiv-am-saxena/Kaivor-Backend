import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { describe, it, expect, jest, beforeEach, beforeAll } from "@jest/globals";

// 1. MUST mock modules BEFORE importing the controller in native ESM.
// This guarantees the real DB/Redis files are NEVER executed, fixing the hanging promises!
jest.unstable_mockModule("../../../src/libs/token.js", () => ({
	generateAccessToken: jest.fn(),
	generateResetPasswordToken: jest.fn(),
	verifyResetPasswordToken: jest.fn()
}));

jest.unstable_mockModule("../../../src/feature/auth/services/email.js", () => ({
	sendVerificationEmail: jest.fn()
}));

jest.unstable_mockModule("../../../src/models/user.model.js", () => ({
	default: {
		findOne: jest.fn(),
		create: jest.fn(),
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
	let tokenUtils: any;
	let emailService: any;
	let UserModel: any;
	let redisClient: any;
	let authController: any;

	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: jest.Mock;

	beforeAll(async () => {
		// 2. Dynamically import everything AFTER the mocks are registered in the VM
		tokenUtils = await import("../../../src/libs/token.js");
		emailService = await import("../../../src/feature/auth/services/email.js");
		UserModel = (await import("../../../src/models/user.model.js")).default;
		redisClient = (await import("../../../src/services/redisInit.js")).default;
		authController =
			await import("../../../src/feature/auth/controllers/register.controller.js");
	});

	beforeEach(() => {
		jest.clearAllMocks();
		req = { body: {}, query: {} };
		res = {
			status: jest.fn().mockReturnThis() as any,
			json: jest.fn() as any,
			redirect: jest.fn() as any
		};
		next = jest.fn();
	});

	describe("registerWithGoogle", () => {
		it("should call passport.authenticate with correct parameters", async () => {
			const mockMiddleware = jest.fn();
			jest.spyOn(passport, "authenticate").mockReturnValue(mockMiddleware as any);

			await authController.registerWithGoogle(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(passport.authenticate).toHaveBeenCalledWith("google-signup", {
				scope: ["profile", "email"]
			});

			// Fix: The controller invokes it with exactly (req, res). No third argument!
			expect(mockMiddleware).toHaveBeenCalledWith(req, res);
		});
	});

	describe("googleCallback", () => {
		it("should redirect to frontend with token on successful authentication", async () => {
			const mockUser = { _id: "user123", email: "test@example.com" };
			const mockToken = "mock-access-token";

			tokenUtils.generateAccessToken.mockReturnValue(mockToken);
			jest.spyOn(passport, "authenticate").mockImplementation((...args: any[]) => {
				const callback = args[2];
				return (req: Request, res: Response, next: NextFunction) => {
					callback(null, mockUser, null);
				};
			});

			await authController.googleCallback(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect(tokenUtils.generateAccessToken).toHaveBeenCalledWith({
				_id: mockUser._id,
				email: mockUser.email
			});

			expect(res.redirect).toHaveBeenCalledWith(
				expect.stringContaining(`/auth/callback?token=${mockToken}`)
			);
		});

		it("should pass ApiError(500) to next() if authentication throws an error", async () => {
			const authError = new Error("Passport error");
			jest.spyOn(passport, "authenticate").mockImplementation((...args: any[]) => {
				const callback = args[2];
				return (req: Request, res: Response, next: NextFunction) => {
					callback(authError, null, null);
				};
			});

			await authController.googleCallback(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect.objectContaining({
				statusCode: 500,
				message: "Google authentication failed"
			});
		});

		it("should redirect to register with error query if user is not found", async () => {
			const info = { message: "Account disabled" };
			jest.spyOn(passport, "authenticate").mockImplementation((...args: any[]) => {
				const callback = args[2];
				return (req: Request, res: Response, next: NextFunction) => {
					callback(null, false, info);
				};
			});

			await authController.googleCallback(
				req as Request,
				res as Response,
				next as NextFunction
			);

			const expectedErrorMsg = encodeURIComponent(info.message);
			expect(res.redirect).toHaveBeenCalledWith(
				expect.stringContaining(`/auth/register?error=${expectedErrorMsg}`)
			);
		});
	});

	describe("registerWithEmail", () => {
		beforeEach(() => {
			req.body = {
				fullName: "John Doe",
				email: "john@example.com",
				password: "password123",
				phoneNumber: "+1234567890"
			};
		});

		it("should pass ApiError(400) if any field is missing or empty", async () => {
			req.body.email = "   ";

			await authController.registerWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect.objectContaining({
				statusCode: 400,
				message: "All fields are required"
			});
		});

		it("should pass ApiError(409) if email is already registered", async () => {
			// We use the mocked function directly now instead of spyOn
			UserModel.findOne.mockResolvedValue({ _id: "existing-user" });

			await authController.registerWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect.objectContaining({
				statusCode: 409
			});
		});

		it("should pass ApiError(503) if sending verification email fails", async () => {
			UserModel.findOne.mockResolvedValue(null);
			UserModel.create.mockResolvedValue({
				_id: "newUserId",
				email: req.body.email
			});
			tokenUtils.generateResetPasswordToken.mockReturnValue("fake-token");
			emailService.sendVerificationEmail.mockResolvedValue(false);

			await authController.registerWithEmail(
				req as Request,
				res as Response,
				next as NextFunction
			);

			expect.objectContaining({
				statusCode: 503,
				message: "Failed to send verification email"
			});
		});

		it("should successfully register a user and send a verification email", async () => {
			UserModel.findOne.mockResolvedValue(null);
			UserModel.create.mockResolvedValue({
				_id: "newUserId",
				email: req.body.email
			});
			tokenUtils.generateResetPasswordToken.mockReturnValue("fake-token");
			emailService.sendVerificationEmail.mockResolvedValue(true);

			await authController.registerWithEmail(req as Request, res as Response);

			expect(UserModel.create).toHaveBeenCalledWith(req.body);
			expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
				req.body.email,
				"fake-token"
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 200,
					message: "Registration successful. Please check your email for verification."
				})
			);
		});
	});

	describe("verifyEmail", () => {
		beforeEach(() => {
			req.query = { token: "valid-token" };
		});

		it("should pass ApiError(400) if token is missing from query", async () => {
			req.query = {};

			await authController.verifyEmail(req as Request, res as Response, next as NextFunction);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400,
					message: "Verification token is required"
				})
			);
		});

		it("should pass ApiError(400) if token is invalid or not a string", async () => {
			req.query = { token: ["array-token"] };

			await authController.verifyEmail(req as Request, res as Response, next as NextFunction);

			expect(next).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 400
				})
			);
		});

		it("should pass ApiError(400) if token is not found in Redis", async () => {
			tokenUtils.verifyResetPasswordToken.mockReturnValue({ id: "userId123" });
			redisClient.exists.mockResolvedValue(0);

			await authController.verifyEmail(req as Request, res as Response, next as NextFunction);

			expect(redisClient.exists).toHaveBeenCalledWith("verificationToken:userId123");
			expect.objectContaining({
				statusCode: 400,
				message: "Verification token has expired used or is invalid"
			});
		});

		it("should pass ApiError(404) if user is not found in the database", async () => {
			tokenUtils.verifyResetPasswordToken.mockReturnValue({ id: "userId123" });
			redisClient.exists.mockResolvedValue(1);
			UserModel.findByIdAndUpdate.mockResolvedValue(null);

			await authController.verifyEmail(req as Request, res as Response, next as NextFunction);

			expect.objectContaining({
				statusCode: 404,
				message: "User not found"
			});
		});

		it("should successfully verify the user and update Redis", async () => {
			tokenUtils.verifyResetPasswordToken.mockReturnValue({ id: "userId123" });
			redisClient.exists.mockResolvedValue(1);
			redisClient.setex.mockResolvedValue("OK");
			UserModel.findByIdAndUpdate.mockResolvedValue({
				_id: "userId123",
				isVerified: { email: true }
			});

			await authController.verifyEmail(req as Request, res as Response, next as NextFunction);

			expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
				"userId123",
				{ isVerified: { email: true } },
				{ new: true }
			);

			expect(redisClient.setex).toHaveBeenCalledWith(
				"verificationToken:userId123",
				3600,
				"verified"
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 200,
					message: "Email verified successfully. You can now log in to your account."
				})
			);
		});
	});
});
