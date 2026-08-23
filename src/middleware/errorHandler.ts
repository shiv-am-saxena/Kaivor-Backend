import { Response, NextFunction, Request } from "express";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";
	res.status(statusCode).json({
		statusCode,
		success: false,
		message,
		errors: err.errors || [],
		data: null
	});
};

export default errorHandler;
