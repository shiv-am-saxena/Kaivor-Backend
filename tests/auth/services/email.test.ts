import { sendVerificationEmail } from "../../../src/libs/email.js";
import { transporter } from "../../../src/services/nodemailer.js";
import logger from "../../../src/libs/logger.js";
import ApiError from "../../../src/utils/ApiError.js";
import Mail from "nodemailer/lib/mailer/index.js";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Use jest.spyOn() to dynamically intercept the real imported objects
// This avoids Jest ESM hoisting issues completely.
const mockedSendMail = jest.spyOn(transporter, "sendMail");
jest.spyOn(logger, "info").mockImplementation(jest.fn() as any);
jest.spyOn(logger, "error").mockImplementation(jest.fn() as any);

describe("sendVerificationEmail", () => {
	const email = "john@example.com";
	const token = "verification-token";

	beforeEach(() => {
		jest.clearAllMocks();

		process.env.BASE_URL = "http://localhost:3000";
		process.env.EMAIL_USER = "noreply@kaivor.com";
	});

	it("should send verification email successfully", async () => {
		mockedSendMail.mockResolvedValue({
			messageId: "123456"
		} as any);

		const result = await sendVerificationEmail(email, token);

		expect(result).toBe(true);

		expect(transporter.sendMail).toHaveBeenCalledTimes(1);

		expect(transporter.sendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: email,
				subject: "Please Verify Your Email",
				// Change this line to be resilient against .env file loads:
				from: expect.stringContaining("Kaivor")
			})
		);

		expect(logger.info).toHaveBeenCalledWith("Verification email sent: 123456");
	});

	it("should include verification url in html", async () => {
		mockedSendMail.mockResolvedValue({
			messageId: "abc"
		} as any);

		await sendVerificationEmail(email, token);

		const mail = (transporter.sendMail as jest.Mock).mock.calls[0][0] as Mail.Options;

		expect(mail.html).toContain("/auth/verify-email?token=verification-token");
	});

	it("should throw ApiError if sendMail fails", async () => {
		mockedSendMail.mockRejectedValue(new Error("SMTP Error"));

		await expect(sendVerificationEmail(email, token)).rejects.toBeInstanceOf(ApiError);

		await expect(sendVerificationEmail(email, token)).rejects.toMatchObject({
			statusCode: 503,
			message: "Could not send verification email"
		});

		expect(logger.error).toHaveBeenCalled();
	});

	it("should log the original error", async () => {
		const error = new Error("SMTP Down");

		mockedSendMail.mockRejectedValue(error);

		await expect(sendVerificationEmail(email, token)).rejects.toThrow(ApiError);

		expect(logger.error).toHaveBeenCalledWith("Error sending verification email:", error);
	});

	it("should call sendMail exactly once", async () => {
		mockedSendMail.mockResolvedValue({
			messageId: "1"
		} as any);

		await sendVerificationEmail(email, token);

		expect(transporter.sendMail).toHaveBeenCalledTimes(1);
	});
});
