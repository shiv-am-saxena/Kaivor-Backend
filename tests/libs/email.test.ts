import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { transporter } from "../../src/services/nodemailer.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../src/libs/email.js";
import ApiError from "../../src/utils/ApiError.js";

describe("Email Lib Unit Tests", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it("should send verification email successfully", async () => {
		jest.spyOn(transporter, "sendMail").mockResolvedValue({ messageId: "msg-123" } as any);

		const result = await sendVerificationEmail("user@example.com", "test-token-123");
		expect(result).toBe(true);
		expect(transporter.sendMail).toHaveBeenCalledTimes(1);
	});

	it("should throw ApiError 503 if verification email sending fails", async () => {
		jest.spyOn(transporter, "sendMail").mockRejectedValue(new Error("SMTP failure"));

		await expect(sendVerificationEmail("user@example.com", "test-token-123")).rejects.toThrow(ApiError);
	});

	it("should send reset password email successfully", async () => {
		jest.spyOn(transporter, "sendMail").mockResolvedValue({ messageId: "msg-456" } as any);

		const result = await sendResetPasswordEmail("user@example.com", "reset-token-456");
		expect(result).toBe(true);
		expect(transporter.sendMail).toHaveBeenCalledTimes(1);
	});

	it("should throw ApiError 503 if reset password email sending fails", async () => {
		jest.spyOn(transporter, "sendMail").mockRejectedValue(new Error("SMTP failure"));

		await expect(sendResetPasswordEmail("user@example.com", "reset-token-456")).rejects.toThrow(ApiError);
	});
});
