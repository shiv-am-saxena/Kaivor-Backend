import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { connect, disconnect, clearCollections } from "../db/test.js";
import UserModel from "../../src/models/user.model.js";
import app from "../../src/app.js";

jest.setTimeout(15000);

jest.mock("../../src/services/redisInit.js", () => ({
	__esModule: true,
	default: {
		get: jest.fn(async () => null),
		set: jest.fn(async () => "OK")
	}
}));

jest.mock("../../src/services/nodemailer.js", () => ({
	__esModule: true,
	transporter: {
		sendMail: jest.fn(async () => ({ messageId: "mocked-id" })),
		verify: jest.fn((cb: any) => cb && cb(null, true))
	}
}));

jest.mock("../../src/libs/email.js", () => ({
	sendVerificationEmail: jest.fn(async () => true),
	sendResetPasswordEmail: jest.fn(async () => true)
}));

describe("Auth Controller & Route Integration Tests", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should register a new user successfully", async () => {
		const res = await request(app).post("/api/auth/register").send({
			fullName: "New User",
			email: "newuser@kaivor.com",
			password: "Password123!",
			phoneNumber: "+1234567890"
		});

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);

		const createdUser = await UserModel.findOne({ email: "newuser@kaivor.com" });
		expect(createdUser).not.toBeNull();
		expect(createdUser?.fullName).toBe("New User");
	});

	it("should return 409 when registering with an existing email", async () => {
		await UserModel.create({
			fullName: "Existing User",
			email: "existing@kaivor.com",
			password: "Password123!",
			phoneNumber: "+1999999999",
			isVerified: { email: true, phone: true }
		});

		const res = await request(app).post("/api/auth/register").send({
			fullName: "Existing User Duplicate",
			email: "existing@kaivor.com",
			password: "Password123!",
			phoneNumber: "+1888888888"
		});

		expect(res.status).toBe(409);
	});

	it("should login user with valid credentials", async () => {
		const password = "Password123!";
		const resRegister = await request(app).post("/api/auth/register").send({
			fullName: "Login User",
			email: "loginuser@kaivor.com",
			password,
			phoneNumber: "+1777777777"
		});
		expect(resRegister.status).toBe(200);

		// Verify email in DB to allow login
		await UserModel.updateOne({ email: "loginuser@kaivor.com" }, { "isVerified.email": true });

		const resLogin = await request(app).post("/api/auth/login").send({
			email: "loginuser@kaivor.com",
			password
		});

		expect(resLogin.status).toBe(200);
		expect(resLogin.body.success).toBe(true);
		expect(resLogin.body.data).toHaveProperty("_id");
		expect(resLogin.headers["set-cookie"]).toBeDefined();
	});

	it("should return 401/400 for incorrect login password", async () => {
		await UserModel.create({
			fullName: "Login User",
			email: "loginuser2@kaivor.com",
			password: "Password123!",
			phoneNumber: "+1666666666",
			isVerified: { email: true, phone: true }
		});

		const resLogin = await request(app).post("/api/auth/login").send({
			email: "loginuser2@kaivor.com",
			password: "WrongPassword!"
		});

		expect(resLogin.status).toBeGreaterThanOrEqual(400);
	});
});
