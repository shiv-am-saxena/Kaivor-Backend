import * as Config from "dotenv";
import * as z from "zod";
import type { StringValue } from "ms";

Config.config();

const envSchema = z.object({
	MONGODB_URI: z.string().min(1, { message: "MONGODB_URI is required" }),
	PORT: z.string().regex(/^\d+$/).transform(Number),
	CORS_ORIGIN: z.string().min(1, { message: "CORS_ORIGIN is required" }),
	NODE_ENV: z.string().min(1, { message: "NODE_ENV is required" }),
	REDIS_PASSWORD: z.string().min(1, { message: "REDIS_PASSWORD is required" }),
	REDIS_HOST: z.string().min(1, { message: "REDIS_HOST is required" }),
	REDIS_PORT: z.string().regex(/^\d+$/).transform(Number),
	GOOGLE_CLIENT_ID: z.string().min(1, { message: "GOOGLE_CLIENT_ID is required" }),
	GOOGLE_CLIENT_SECRET: z.string().min(1, { message: "GOOGLE_CLIENT_SECRET is required" }),
	JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
	JWT_EXPIRES_IN: z.custom<StringValue>(),
	JWT_REFRESH_SECRET: z.string().min(1, { message: "JWT_REFRESH_SECRET is required" }),
	JWT_REFRESH_EXPIRES_IN: z.custom<StringValue>(),
	JWT_RESET_PASSWORD_SECRET: z
		.string()
		.min(1, { message: "JWT_RESET_PASSWORD_SECRET is required" }),
	JWT_RESET_PASSWORD_EXPIRES_IN: z.custom<StringValue>(),
	EMAIL_USER: z.string().min(1, { message: "EMAIL_USER is required" }),
	EMAIL_PASS: z.string().min(1, { message: "EMAIL_PASS is required" }),
	BASE_URL: z.string().min(1, { message: "BASE_URL is required" }),
	AWS_REGION: z.string().min(1, { message: "AWS_REGION is required" }),
	AWS_ACCESS_KEY_ID: z.string().min(1, { message: "AWS_ACCESS_KEY_ID is required" }),
	AWS_SECRET_ACCESS_KEY: z.string().min(1, { message: "AWS_SECRET_ACCESS_KEY is required" }),
	AWS_S3_BUCKET_NAME: z.string().min(1, { message: "AWS_S3_BUCKET_NAME is required" }),
	RAZORPAY_API_KEY: z.string().min(1, { message: "RAZORPAY_API_KEY is required" }),
	RAZORPAY_API_SECRET: z.string().min(1, { message: "RAZORPAY_API_SECRET is required" }),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
	MONGODB_URI: parsedEnv.MONGODB_URI,
	PORT: parsedEnv.PORT,
	CORS_ORIGIN: parsedEnv.CORS_ORIGIN,
	NODE_ENV: parsedEnv.NODE_ENV,
	REDIS_PASSWORD: parsedEnv.REDIS_PASSWORD,
	REDIS_HOST: parsedEnv.REDIS_HOST,
	REDIS_PORT: parsedEnv.REDIS_PORT,
	GOOGLE_CLIENT_ID: parsedEnv.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: parsedEnv.GOOGLE_CLIENT_SECRET,
	JWT_SECRET: parsedEnv.JWT_SECRET,
	JWT_EXPIRES_IN: parsedEnv.JWT_EXPIRES_IN,
	JWT_REFRESH_SECRET: parsedEnv.JWT_REFRESH_SECRET,
	JWT_REFRESH_EXPIRES_IN: parsedEnv.JWT_REFRESH_EXPIRES_IN,
	JWT_RESET_PASSWORD_SECRET: parsedEnv.JWT_RESET_PASSWORD_SECRET,
	JWT_RESET_PASSWORD_EXPIRES_IN: parsedEnv.JWT_RESET_PASSWORD_EXPIRES_IN,
	EMAIL_USER: parsedEnv.EMAIL_USER,
	EMAIL_PASS: parsedEnv.EMAIL_PASS,
	BASE_URL: parsedEnv.BASE_URL,
	AWS_REGION: parsedEnv.AWS_REGION,
	AWS_ACCESS_KEY_ID: parsedEnv.AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY: parsedEnv.AWS_SECRET_ACCESS_KEY,
	AWS_S3_BUCKET_NAME: parsedEnv.AWS_S3_BUCKET_NAME,
	RAZORPAY_API_KEY: parsedEnv.RAZORPAY_API_KEY,
	RAZORPAY_API_SECRET: parsedEnv.RAZORPAY_API_SECRET,
};
