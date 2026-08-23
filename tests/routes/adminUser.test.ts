import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { connect, disconnect, clearCollections } from "../db/test.js";
import UserModel from "../../src/models/user.model.js";
import { generateAccessToken } from "../../src/libs/token.js";
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

describe("Admin User Controller Integration Tests", () => {
	let adminToken: string;

	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();

		const admin = await UserModel.create({
			fullName: "Super Admin",
			email: "admin@kaivor.com",
			password: "Password123!",
			role: "admin",
			isVerified: { email: true, phone: true }
		});

		adminToken = generateAccessToken({ _id: admin._id.toString(), email: admin.email });
	});

	it("should allow admin to add a new user", async () => {
		const res = await request(app)
			.post("/api/admin/auth/add-new-user")
			.set("Cookie", [`accessToken=${adminToken}`])
			.send({
				fullName: "Sub User",
				email: "subuser@kaivor.com",
				password: "Password123!",
				phoneNumber: "+15554443333",
				role: "supplier"
			});

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);

		const created = await UserModel.findOne({ email: "subuser@kaivor.com" });
		expect(created).not.toBeNull();
		expect(created?.role).toBe("supplier");
	});

	it("should allow admin to update user role", async () => {
		const targetUser = await UserModel.create({
			fullName: "Target User",
			email: "target@kaivor.com",
			password: "Password123!",
			role: "user"
		});

		const res = await request(app)
			.post("/api/admin/auth/update-user-role")
			.set("Cookie", [`accessToken=${adminToken}`])
			.send({
				email: targetUser.email,
				role: "admin"
			});

		expect(res.status).toBe(200);

		const updated = await UserModel.findById(targetUser._id);
		expect(updated?.role).toBe("admin");
	});
});
