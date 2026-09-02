import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import { Request, Response } from "express";
import redisClient from "../../../../services/redisInit.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import ApiError from "../../../../utils/ApiError.js";
import HomepageVersionModel from "../../../../models/homepageVersion.model.js";
import logger from "../../../../libs/logger.js";

const HOMEPAGE_CACHE_KEY = "layout:last_published";
const TTL_300_MINUTES = 300 * 60; // 300 minutes in seconds (18,000s)

/*
	**** Get Last Published Homepage Layout (Server-Driven UI) ****
	Fetches the latest published version of the homepage layout.
	Caches the layout in Redis for 300 minutes (18,000 seconds).
	@response: { homepageVersion }
	@endpoint: GET /api/admin/homepage/public-layout
*/
export const getPublicLayout = asyncHandler(async (req: Request, res: Response) => {
	logger.info("Fetching last published homepage layout");

	// 1. Check Redis Cache
	const cachedLayout = await redisClient.get(HOMEPAGE_CACHE_KEY);
	if (cachedLayout) {
		logger.info("Returning published homepage layout from Redis cache");
		const parsedLayout = JSON.parse(cachedLayout);
		res.status(200).json(
			new ApiResponse(200, parsedLayout, "Homepage layout fetched successfully (from cache)")
		);
		return;
	}

	// 2. Fetch the latest published homepage version from DB
	const publishedVersion = await HomepageVersionModel.findOne({ status: "published" }).sort({
		publishedAt: -1,
		versionNumber: -1
	});

	if (!publishedVersion) {
		throw new ApiError(404, "No published homepage layout found");
	}

	// 3. Store in Redis cache with TTL of 300 minutes
	await redisClient.set(HOMEPAGE_CACHE_KEY, JSON.stringify(publishedVersion), "EX", TTL_300_MINUTES);

	res.status(200).json(
		new ApiResponse(200, publishedVersion, "Homepage layout fetched successfully")
	);
});
