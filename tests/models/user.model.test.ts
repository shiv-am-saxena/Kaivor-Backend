import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals";
import { connect, disconnect, clearCollections } from "../db/test.js";
import UserModel from "../../src/models/user.model.js";

jest.setTimeout(30000);

describe("User Model Unit Tests", () => {
	beforeAll(async () => {
		await connect();
	});

	afterAll(async () => {
		await disconnect();
	});

	beforeEach(async () => {
		await clearCollections();
	});

	it("should create a user successfully with default role 'user'", async () => {
		const user = await UserModel.create({
			fullName: "Alice Test",
			email: "alice@example.com",
			password: "HashedPassword123!"
		});

		expect(user._id).toBeDefined();
		expect(user.fullName).toBe("Alice Test");
		expect(user.email).toBe("alice@example.com");
		expect(user.role).toBe("user");
		expect(user.isVerified?.email).toBe(false);
		expect(user.isVerified?.phone).toBe(false);
	});

	it("should fail validation if email is invalid", async () => {
		await expect(
			UserModel.create({
				fullName: "Invalid Email",
				email: "not-an-email",
				password: "Password123!"
			})
		).rejects.toThrow();
	});

	it("should enforce unique email constraint", async () => {
		await UserModel.create({
			fullName: "User One",
			email: "duplicate@example.com",
			password: "Password123!"
		});

		await expect(
			UserModel.create({
				fullName: "User Two",
				email: "duplicate@example.com",
				password: "Password123!"
			})
		).rejects.toThrow();
	});
});
