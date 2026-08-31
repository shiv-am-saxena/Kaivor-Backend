import app from "./app.js";
import connectDB from "./db/index.js";
import { env } from "./config/index.js";
import http from "http";
import logger from "./libs/logger.js";
import redisClient from "./services/redisInit.js";
import { transporter } from "./services/nodemailer.js";
import s3Service from "./services/s3.js";
import initRazorpay from "./services/razorpay.js";
const server = http.createServer(app);

Promise.all([connectDB(), redisClient.ping(), transporter.verify(), s3Service(), initRazorpay()])
	.then(() => {
		logger.info("✅ All services initialized successfully");
		server.listen(env.PORT, () => {
			logger.info(`Server is running on port ${env.PORT}`);
		});
	})
	.catch((error: unknown) => {
		const message = error instanceof Error ? error.message : String(error);
		logger.error(`Failed to connect to the database: ${message}`);
		process.exit(1); // Exit the process with an error code
	});
