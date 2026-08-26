import { Response, Request, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err: ApiError, req: Request, res: Response, _next: NextFunction): void => {
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json(err);
};

export default errorHandler;
