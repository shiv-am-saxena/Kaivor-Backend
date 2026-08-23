import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import { connect, disconnect, clearCollections } from "../db/test.js";
import { isLoggedIn } from "../../src/middleware/isLoggedIn.js";
import UserModel from "../../src/models/user.model.js";
import { generateAccessToken } from "../../src/libs/token.js";
import { Request, Response, NextFunction } from "express";
import ApiError from "../../src/utils/ApiError.js";
import IUser from "../../src/types/schema/user.js";

describe("isLoggedIn Middleware", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should call next with 401 ApiError if no token is provided", async () => {
		const req = {
			headers: {},
			cookies: {}
		} as unknown as Request;
		const res = {} as Response;
		const next: NextFunction = jest.fn();

		await isLoggedIn(req, res, next);

		expect(next).toHaveBeenCalledWith(expect.any(ApiError));
	});

	it("should attach user to req and call next() for valid user token", async () => {
		const user: IUser = await UserModel.create({
			fullName: "John Doe",
			email: "john@example.com",
			password: "Password123!",
			role: "user",
			isVerified: { email: true, phone: true }
		});

		const token = generateAccessToken({ _id: user._id.toString(), email: user.email });

		const req = {
			headers: { authorization: `Bearer ${token}` },
			cookies: {}
		} as unknown as Request;
		const res = {} as Response;
		const next: NextFunction = jest.fn();

		await isLoggedIn(req, res, next);

		expect(req.user).toBeDefined();
		expect(req.user?._id.toString()).toBe(user._id.toString());
		expect(next).toHaveBeenCalled();
	});
});
