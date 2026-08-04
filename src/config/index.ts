import * as Config from 'dotenv';
import * as z from 'zod';

Config.config();

const envSchema = z.object({
    MONGODB_URI: z.string().url(),
    PORT: z.string().regex(/^\d+$/).transform(Number),
    CORS_ORIGIN: z.string().url(),
});

export const env = {
    MONGODB_URI: envSchema.parse(process.env).MONGODB_URI,
    PORT: envSchema.parse(process.env).PORT,
    CORS_ORIGIN: envSchema.parse(process.env).CORS_ORIGIN,
}
