import nodemailer from "nodemailer";
import logger from "../libs/logger.js";
import { env } from "../config/index.js";

// 1. Configure the transporter

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: env.EMAIL_USER ,
		pass: env.EMAIL_PASS
	}
});

// 2. Verify the connection on startup
transporter.verify((error: Error | null, _success: true) => {
	if (error) {
		logger.error("Error connecting to email service:", error);
	} else {
		logger.info("Email service is ready to send messages");
	}
});
