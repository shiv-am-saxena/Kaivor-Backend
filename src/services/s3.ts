import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/index.js";
import logger from "../libs/logger.js";

export let s3Client: S3Client;

const s3Service = async (): Promise<S3Client> => {
	const s3 = new S3Client({
		region: env.AWS_REGION,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY
		}
	});
	if (s3) {
		logger.info("S3 connection established");
		s3Client = s3;
		return await Promise.resolve(s3Client);
	} else {
		return await Promise.reject(new Error("Failed to connect to S3"));
	}
};

export default s3Service;
