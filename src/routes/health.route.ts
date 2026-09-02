import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import redisClient from "../services/redisInit.js";
import ApiResponse from "../utils/ApiResponse.js";
import { env } from "../config/index.js";

const router = Router();

const getFormattedTimestamp = (): string => {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("sv-SE", {
		timeZone: "Asia/Kolkata",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
	return `${formatter.format(now).replace(" ", "T")}+05:30`;
};

/**
 * 1. GET /api/health/live
 * Process Liveness check: lightweight check verifying Node.js process is active.
 * Must NOT depend on MongoDB or Redis.
 */
router.get("/health/live", (_req: Request, res: Response) => {
	res.status(200).json(
		new ApiResponse(
			200,
			{
				status: "live",
				timestamp: getFormattedTimestamp(),
				uptimeSeconds: Math.floor(process.uptime())
			},
			"Liveness check passed"
		)
	);
});

/**
 * 2. GET /api/health/ready
 * Application Readiness check: evaluates production traffic readiness (MongoDB, Redis, SDUI fallback).
 */
router.get("/health/ready", async (_req: Request, res: Response) => {
	const mongoState = mongoose.connection.readyState;
	const isMongoConnected = mongoState === 1;

	let cacheStatus: "up" | "down" | "disabled" = "disabled";
	if (env.SDUI_CACHE_ENABLED) {
		try {
			const pingResult = await redisClient.ping();
			cacheStatus = pingResult === "PONG" ? "up" : "down";
		} catch {
			cacheStatus = "down";
		}
	}

	const isReady = isMongoConnected; // App serves production traffic & falls back to DB if Redis is down
	const statusSummary = isReady
		? cacheStatus === "down"
			? "degraded"
			: "ready"
		: "not-ready";

	const payload = {
		status: statusSummary,
		timestamp: getFormattedTimestamp(),
		services: {
			application: "up",
			database: isMongoConnected ? "up" : "down",
			cache: cacheStatus,
			sduiFallbackReady: true
		}
	};

	res.status(isReady ? 200 : 503).json(
		new ApiResponse(isReady ? 200 : 503, payload, isReady ? "Readiness check passed" : "Readiness check failed")
	);
});

/**
 * 3. GET /api/health
 * Backward-compatible general health check.
 */
router.get("/health", async (_req: Request, res: Response) => {
	const mongoState = mongoose.connection.readyState;
	const isMongoConnected = mongoState === 1;

	let isRedisConnected = false;
	if (env.SDUI_CACHE_ENABLED) {
		try {
			const pingResult = await redisClient.ping();
			isRedisConnected = pingResult === "PONG";
		} catch {
			isRedisConnected = false;
		}
	}

	const isHealthy = isMongoConnected;

	const payload = {
		timestamp: getFormattedTimestamp(),
		status: isHealthy ? "healthy" : "unhealthy",
		services: {
			database: isMongoConnected ? "connected" : "disconnected",
			cache: !env.SDUI_CACHE_ENABLED ? "disabled" : isRedisConnected ? "connected" : "degraded",
			sduiFallbackReady: true
		}
	};

	res.status(isHealthy ? 200 : 503).json(
		new ApiResponse(isHealthy ? 200 : 503, payload, isHealthy ? "Health check passed" : "Health check failed")
	);
});

export default router;
