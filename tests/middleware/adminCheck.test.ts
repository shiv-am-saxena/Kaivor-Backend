import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import { connect, disconnect, clearCollections } from "../db/test.js";
import { adminAuthMiddleware } from "../../src/middleware/adminCheck.js";
import UserModel from "../../src/models/user.model.js";
import { generateAccessToken } from "../../src/libs/token.js";
import { Request, Response, NextFunction } from "express";
import ApiError from "../../src/utils/ApiError.js";

describe("adminAuthMiddleware", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should call next with 403 ApiError if user role is not admin", async () => {
		const regularUser = await UserModel.create({
			fullName: "Normal User",
			email: "user@example.com",
			password: "Password123!",
			role: "user",
			isVerified: { email: true, phone: true }
		});

		const token = generateAccessToken({ _id: regularUser._id.toString(), email: regularUser.email });

		const req = {
			headers: { authorization: `Bearer ${token}` },
			cookies: {}
		} as unknown as Request;
		const res = {} as Response;
		const next: NextFunction = jest.fn();

		await adminAuthMiddleware(req, res, next);

		expect(next).toHaveBeenCalledWith(expect.any(ApiError));
	});

	it("should succeed and call next() if user role is admin", async () => {
		const adminUser = await UserModel.create({
			fullName: "Admin User",
			email: "admin@example.com",
			password: "Password123!",
			role: "admin",
			isVerified: { email: true, phone: true }
		});

		const token = generateAccessToken({ _id: adminUser._id.toString(), email: adminUser.email });

		const req = {
			headers: { authorization: `Bearer ${token}` },
			cookies: {}
		} as unknown as Request;
		const res = {} as Response;
		const next: NextFunction = jest.fn();

		await adminAuthMiddleware(req, res, next);

		expect(req.user).toBeDefined();
		expect(req.user?.role).toBe("admin");
		expect(next).toHaveBeenCalled();
	});
});
