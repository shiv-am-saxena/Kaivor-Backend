import { env } from "../../../config/index.js";
import s3Service from "../../../services/s3.js";
import {
	DeleteObjectCommand,
	PutObjectCommand,
	type PutObjectCommandOutput
} from "@aws-sdk/client-s3";
import ApiError from "../../../utils/ApiError.js";

const s3 = await s3Service(); //initialize s3 service

export const uploadFile = async (file: Express.Multer.File, key: string): Promise<string> => {
	const uploadParams = {
		Bucket: env.AWS_S3_BUCKET_NAME,
		Key: key,
		Body: file.buffer,
		ContentType: file.mimetype
	};

	const command = new PutObjectCommand(uploadParams);

	const response: PutObjectCommandOutput = await s3.send(command);

	if (response.$metadata.httpStatusCode !== 200) {
		throw new ApiError(400, `Failed to upload file to S3: ${key}`);
	}

	return key;
};


export const deleteFile = async (key: string): Promise<void> => {
	await s3.send(
		new DeleteObjectCommand({
			Bucket: env.AWS_S3_BUCKET_NAME,
			Key: key
		})
	);
};
