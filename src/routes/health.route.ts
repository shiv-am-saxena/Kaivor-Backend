import { Request, Response, Router } from "express";
import ApiResponse from "../utils/ApiResponse.js";
const router = Router();

router.get("/health", (req:Request, res:Response) => {
    const timestamp = new Date().toISOString();
	res.status(200).json(new ApiResponse(200, timestamp, "Health check passed"));
});

export default router;
