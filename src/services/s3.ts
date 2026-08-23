import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/index.js";
import logger from "../libs/logger.js";

const s3Service = async (): Promise<S3Client> => {
	try {
		const s3 = new S3Client({
			region: env.AWS_REGION,
			credentials: {
				accessKeyId: env.AWS_ACCESS_KEY_ID,
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY
			}
		});
		logger.info("S3 connection established");
		return await Promise.resolve(s3);
		
	} catch (error) {
		logger.error("Error connecting to S3:", error);
		throw error;
	}
};

export default s3Service;
