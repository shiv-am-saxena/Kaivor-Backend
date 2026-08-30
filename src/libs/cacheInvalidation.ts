import redisClient from "../services/redisInit.js";
import logger from "./logger.js";

/**
 * Invalidates product-related Redis caches whenever a product is created, updated, or deleted.
 * Uses redisClient.scanStream (non-blocking cursor) to match and clear:
 * - `products:*` (all paginated product list/search caches across user roles)
 * - `product:*:${productId}` (specific product detail caches across user roles, if productId is provided)
 *
 * @param productId - Optional ID of the product being updated or deleted.
 */
export const invalidateProductCache = async (productId?: string): Promise<void> => {
	try {
		const patternsToDelete: string[] = ["products:*"];

		if (productId) {
			patternsToDelete.push(`product:*:${productId}`);
		}

		for (const pattern of patternsToDelete) {
			const stream = redisClient.scanStream({
				match: pattern,
				count: 100
			});

			stream.on("data", async (keys: string[]) => {
				if (keys.length > 0) {
					const pipeline = redisClient.pipeline();
					keys.forEach((key) => pipeline.del(key));
					await pipeline.exec();
				}
			});

			await new Promise<void>((resolve, reject) => {
				stream.on("end", () => resolve());
				stream.on("error", (err) => reject(err));
			});
		}

		logger.info(`Product cache successfully invalidated for pattern(s): ${patternsToDelete.join(", ")}`);
	} catch (error) {
		logger.error("Failed to invalidate product cache from Redis:", error);
	}
};

