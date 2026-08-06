import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../src/config/index";
import {
	generateAccessToken,
	generateRefreshToken,
	generateResetPasswordToken,
	verifyAccessToken,
	verifyRefreshToken,
	verifyResetPasswordToken
} from "../../src/libs/token";
import { describe, it, expect } from "@jest/globals";

describe("JWT Utility", () => {
	const payload: JwtPayload = {
		id: "123",
		email: "john@example.com"
	};

	describe("generateAccessToken", () => {
		it("should generate a valid access token", () => {
			const token = generateAccessToken(payload);

			expect(typeof token).toBe("string");

			const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

			expect(decoded.userId).toBe(payload.userId);
			expect(decoded.email).toBe(payload.email);
			expect(decoded.role).toBe(payload.role);
		});
	});

	describe("generateRefreshToken", () => {
		it("should generate a valid refresh token", () => {
			const token = generateRefreshToken(payload);

			expect(typeof token).toBe("string");

			const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;

			expect(decoded.userId).toBe(payload.userId);
		});
	});

	describe("generateResetPasswordToken", () => {
		it("should generate a valid reset password token", () => {
			const token = generateResetPasswordToken(payload);

			expect(typeof token).toBe("string");

			const decoded = jwt.verify(token, env.JWT_RESET_PASSWORD_SECRET) as JwtPayload;

			expect(decoded.userId).toBe(payload.userId);
		});
	});

	describe("verifyAccessToken", () => {
		it("should verify a valid access token", () => {
			const token = generateAccessToken(payload);

			const decoded = verifyAccessToken(token);

			expect(decoded.userId).toBe(payload.userId);
			expect(decoded.email).toBe(payload.email);
			expect(decoded.role).toBe(payload.role);
		});

		it("should throw for an invalid token", () => {
			expect(() => verifyAccessToken("invalid-token")).toThrow(jwt.JsonWebTokenError);
		});

		it("should throw when verifying a refresh token", () => {
			const refreshToken = generateRefreshToken(payload);

			expect(() => verifyAccessToken(refreshToken)).toThrow();
		});
	});

	describe("verifyRefreshToken", () => {
		it("should verify a valid refresh token", () => {
			const token = generateRefreshToken(payload);

			const decoded = verifyRefreshToken(token);

			expect(decoded.userId).toBe(payload.userId);
		});

		it("should throw for an invalid token", () => {
			expect(() => verifyRefreshToken("invalid-token")).toThrow(jwt.JsonWebTokenError);
		});

		it("should throw when verifying an access token", () => {
			const accessToken = generateAccessToken(payload);

			expect(() => verifyRefreshToken(accessToken)).toThrow();
		});
	});

	describe("verifyResetPasswordToken", () => {
		it("should verify a valid reset password token", () => {
			const token = generateResetPasswordToken(payload);

			const decoded = verifyResetPasswordToken(token);

			expect(decoded.userId).toBe(payload.userId);
		});

		it("should throw for an invalid token", () => {
			expect(() => verifyResetPasswordToken("invalid-token")).toThrow(jwt.JsonWebTokenError);
		});

		it("should throw when verifying an access token", () => {
			const accessToken = generateAccessToken(payload);

			expect(() => verifyResetPasswordToken(accessToken)).toThrow();
		});
	});

	describe("Token Isolation", () => {
		it("should generate different tokens", () => {
			const access = generateAccessToken(payload);
			const refresh = generateRefreshToken(payload);
			const reset = generateResetPasswordToken(payload);

			expect(access).not.toBe(refresh);
			expect(access).not.toBe(reset);
			expect(refresh).not.toBe(reset);
		});
	});
});
