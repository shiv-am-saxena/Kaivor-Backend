import { transporter } from "../../../services/nodemailer.js";
import logger from "../../../libs/logger.js";
import ApiError from "../../../utils/ApiError.js";
import Mail from "nodemailer/lib/mailer/index.js";

export const sendVerificationEmail = async (
	userEmail: string,
	verificationToken: string
): Promise<boolean> => {
	try {
		const baseUrl = process.env.BASE_URL as string;
		const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

		// Use Mail.Options to strictly type the email configuration
		const mailOptions: Mail.Options = {
			from: `"Kaivor" <${process.env.EMAIL_USER}>`,
			to: userEmail,
			subject: "Please Verify Your Email",
			html: `
            <div>
                <h2>Welcome to Our App!</h2>
                <p>Click the link below to verify your email address and activate your account:</p>
                <br/>
                <a  href="${verificationUrl}"
                    style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px">
                    Verify Email
                </a>
                <br/>
                <p>If you did not request this, please ignore this email.</p>
                <br />
                <p>Or copy and paste this link into your browser:</p>
                <p>${verificationUrl}</p>
            </div>`
		};

		const info = await transporter.sendMail(mailOptions);
		logger.info(`Verification email sent: ${info.messageId}`);
		return true;
	} catch (error) {
		logger.error("Error sending verification email:", error);
		throw new ApiError(503,"Could not send verification email");
	}
};
