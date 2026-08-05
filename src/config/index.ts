import * as Config from 'dotenv';
import * as z from 'zod';

Config.config();

const envSchema = z.object({
    MONGODB_URI: z.string().min(1, { message: "MONGODB_URI is required" }), // Make sure to validate that the URI is not empty
    PORT: z.string().regex(/^\d+$/).transform(Number), // Validate that PORT is a string of digits and transform it to a number
    CORS_ORIGIN: z.string().min(1, { message: "CORS_ORIGIN is required" }),// Validate that CORS_ORIGIN is not empty
    NODE_ENV: z.string().min(1, { message: "NODE_ENV is required" }), // Validate that NODE_ENV is not empty
    REDIS_PASSWORD: z.string().min(1, { message: "REDIS_PASSWORD is required" }), // Validate that REDIS_PASSWORD is not empty
    REDIS_HOST: z.string().min(1, { message: "REDIS_HOST is required" }), // Validate that REDIS_HOST is not empty
    REDIS_PORT: z.string().regex(/^\d+$/).transform(Number), // Validate that REDIS_PORT is a string of digits and transform it to a number
    GOOGLE_CLIENT_ID: z.string().min(1, { message: "GOOGLE_CLIENT_ID is required" }), // Validate that GOOGLE_CLIENT_ID is not empty
    GOOGLE_CLIENT_SECRET: z.string().min(1, { message: "GOOGLE_CLIENT_SECRET is required" }), // Validate that GOOGLE_CLIENT_SECRET is not empty
    JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }), // Validate that JWT_SECRET is not empty
    JWT_EXPIRES_IN: z.string().min(1, { message: "JWT_EXPIRES_IN is required" }), // Validate that JWT_EXPIRES_IN is not empty
});

export const env = {
    MONGODB_URI: envSchema.parse(process.env).MONGODB_URI,
    PORT: envSchema.parse(process.env).PORT,
    CORS_ORIGIN: envSchema.parse(process.env).CORS_ORIGIN,
    NODE_ENV: envSchema.parse(process.env).NODE_ENV,
    REDIS_PASSWORD: envSchema.parse(process.env).REDIS_PASSWORD,
    REDIS_HOST: envSchema.parse(process.env).REDIS_HOST,
    REDIS_PORT: envSchema.parse(process.env).REDIS_PORT,
    GOOGLE_CLIENT_ID: envSchema.parse(process.env).GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: envSchema.parse(process.env).GOOGLE_CLIENT_SECRET,
    JWT_SECRET: envSchema.parse(process.env).JWT_SECRET,
    JWT_EXPIRES_IN: envSchema.parse(process.env).JWT_EXPIRES_IN,
}
