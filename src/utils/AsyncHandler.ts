import { IRequestHandler } from "../types/RequestHandler.js";
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: IRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
        return Promise.resolve(fn(req, res, next)).catch((err) => {
            next(err);
        });
    };
}