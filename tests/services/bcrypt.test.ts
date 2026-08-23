import { describe, it, expect } from "@jest/globals";
import { hashPassword, comparePassword } from "../../src/feature/auth/services/bcrypt.js";

describe("Bcrypt Service Unit Tests", () => {
	it("should hash a plain text password and verify it successfully", async () => {
		const plainPassword = "SecurePassword123!";
		const hashedPassword = await hashPassword(plainPassword);

		expect(hashedPassword).toBeDefined();
		expect(hashedPassword).not.toEqual(plainPassword);

		const isMatch = await comparePassword(plainPassword, hashedPassword);
		expect(isMatch).toBe(true);
	});

	it("should return false for incorrect password verification", async () => {
		const plainPassword = "SecurePassword123!";
		const wrongPassword = "WrongPassword456!";
		const hashedPassword = await hashPassword(plainPassword);

		const isMatch = await comparePassword(wrongPassword, hashedPassword);
		expect(isMatch).toBe(false);
	});
});
