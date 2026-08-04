import * as Config from 'dotenv';
import * as z from 'zod';

Config.config();

const envSchema = z.object({
    MONGODB_URI: z.string().min(1, { message: "MONGODB_URI is required" }), // Make sure to validate that the URI is not empty
    PORT: z.string().regex(/^\d+$/).transform(Number), // Validate that PORT is a string of digits and transform it to a number
    CORS_ORIGIN: z.string().min(1, { message: "CORS_ORIGIN is required" }),// Validate that CORS_ORIGIN is not empty
    NODE_ENV: z.string().min(1, { message: "NODE_ENV is required" }), // Validate that NODE_ENV is not empty
});

export const env = {
    MONGODB_URI: envSchema.parse(process.env).MONGODB_URI,
    PORT: envSchema.parse(process.env).PORT,
    CORS_ORIGIN: envSchema.parse(process.env).CORS_ORIGIN,
    NODE_ENV: envSchema.parse(process.env).NODE_ENV,
}
