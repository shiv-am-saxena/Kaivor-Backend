import { Redis } from "ioredis";
import { env } from "../config/index.js";
import logger from "../libs/logger.js";

const redisClient = new Redis({
	port: env.REDIS_PORT,
	host: env.REDIS_HOST,
	password: env.REDIS_PASSWORD,
	lazyConnect: env.NODE_ENV === "test",
	maxRetriesPerRequest: env.NODE_ENV === "test" ? 0 : undefined,
	enableOfflineQueue: env.NODE_ENV !== "test"
});

redisClient.on("error", (err) => {
	logger.error("Redis Error:", err);
});

redisClient.on("connect", () => {
	logger.info("Redis connect");
});

redisClient.on("ready", () => {
	logger.info("Redis ready");
});

redisClient.on("reconnecting", () => {
	logger.info("Redis reconnecting");
});

export default redisClient;