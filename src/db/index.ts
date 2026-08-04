import mongoose from "mongoose";
import { env } from "../config/index.js";
import logger from "../libs/logger.js";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async (): Promise<void> => {
	let attempt = 1;

	while (attempt <= MAX_RETRIES) {
		try {
			const conn = await mongoose.connect(env.MONGODB_URI);

			logger.info(`MongoDB Connected: ${conn.connection.host}`);
			return; // Exit the function if the connection is successful
		} catch (error) {
			logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed.`, error);

			if (attempt === MAX_RETRIES) {
				logger.error("Maximum retry attempts reached. Exiting application.");
				process.exit(1);
			}
			const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff

			logger.info(`Retrying in ${delay / 1000} seconds...`);

			await sleep(delay); // Wait before retrying
			attempt++;
		}
	}
};

export default connectDB;
