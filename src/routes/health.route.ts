import { Request, Response, Router } from "express";
import ApiResponse from "../utils/ApiResponse.js";
const router = Router();

router.get("/health", (req: Request, res: Response) => {
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
	const timestamp = formatter.format(now).replace(" ", "T") + "+05:30";

	res.status(200).json(new ApiResponse(200, timestamp, "Health check passed"));
});

export default router;
