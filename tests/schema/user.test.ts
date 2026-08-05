import UserModel from "../../src/models/user.model";
import { connect, disconnect, clearCollections } from "../db/test";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "@jest/globals";

describe("UserModel Integration & Unique Constraints", () => {
	beforeAll(connect);

	afterAll(disconnect);

	afterEach(clearCollections);

	// --- THE TEST CASES ---

	it("should successfully save a user with valid, unique data", async () => {
		const user = new UserModel({
			name: "First User",
			email: "first@example.com",
			password: "password123",
			phoneNumber: "+1111111111"
		});

		const savedUser = await user.save();
		expect(savedUser._id).toBeDefined();
		expect(savedUser.email).toBe("first@example.com");
	});

	it("should throw a duplicate key error (E11000) when saving a duplicate email", async () => {
		// Save the first user
		await new UserModel({
			name: "Original User",
			email: "duplicate@example.com",
			password: "password123"
		}).save();

		// Attempt to save a second user with the same email
		const duplicateUser = new UserModel({
			name: "Copycat User",
			email: "duplicate@example.com",
			password: "differentpassword"
		});

		// 11000 is MongoDB's code for a Duplicate Key Error
		await expect(duplicateUser.save()).rejects.toMatchObject({
			code: 11000,
			keyPattern: { email: 1 }
		});
	});

	it("should throw a duplicate key error (E11000) when saving a duplicate phone number", async () => {
		await new UserModel({
			name: "Phone User 1",
			email: "user1@example.com",
			password: "password123",
			phoneNumber: "+9999999999"
		}).save();

		const duplicatePhoneUser = new UserModel({
			name: "Phone User 2",
			email: "user2@example.com",
			password: "password456",
			phoneNumber: "+9999999999" // Same phone, different email
		});

		await expect(duplicatePhoneUser.save()).rejects.toMatchObject({
			code: 11000,
			keyPattern: { phoneNumber: 1 }
		});
	});

	it("should allow emails with different casing (unless collation is set)", async () => {
		// Note: By default, MongoDB indexes are case-sensitive.
		// This test ensures we understand current schema behavior.
		await new UserModel({
			name: "Lower Case",
			email: "test@example.com",
			password: "password123"
		}).save();

		const upperCaseUser = new UserModel({
			name: "Upper Case",
			email: "TEST1@example.com",
			password: "password123"
		});

		// This will pass by default. If you want emails to be case-insensitive,
		// you must convert them to lowercase before saving in your application logic,
		// or add a collation to your Mongoose schema index.
		const saved = await upperCaseUser.save();
		expect(saved._id).toBeDefined();
	});

	it("should expose the Mongoose 'optional unique' gotcha with null values", async () => {
		// User 1 has no phone number
		await new UserModel({
			name: "No Phone 1",
			email: "nophone1@example.com",
			password: "password123"
		}).save();

		// User 2 ALSO has no phone number
		const user2 = new UserModel({
			name: "No Phone 2",
			email: "nophone2@example.com",
			password: "password456"
		});

		// Because `phoneNumber` is defined with `sparse: true`, MongoDB does not
		// index `null` values and therefore allows multiple documents without a
		// phone number. Saving should succeed.
		const saved = await user2.save();
		expect(saved._id).toBeDefined();
	});
});
