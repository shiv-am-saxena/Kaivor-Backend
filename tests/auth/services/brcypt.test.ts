import { describe, it, expect } from "@jest/globals";
import { hashPassword, comparePassword } from "../../../src/feature/auth/services/bcrypt";

describe("Bcrypt Service", () => {
    it("should hash a password and compare it successfully", async () => {
        const password = "mySecurePassword123!";
        const hashedPassword = await hashPassword(password);
        const isMatch = await comparePassword(password, hashedPassword);

        expect(hashedPassword).not.toBe(password); // Ensure the hashed password is different from the original
        expect(isMatch).toBe(true);// Ensure the comparison returns true for the correct password
    });

    it("should return false for a non-matching password", async () => {
        const password = "mySecurePassword123!";
        const wrongPassword = "wrongPassword456!";
        const hashedPassword = await hashPassword(password);// Hash the original password
        const isMatch = await comparePassword(wrongPassword, hashedPassword);// Compare the wrong password with the hashed original password

        expect(isMatch).toBe(false);
    });
});