import { IRequestHandler } from "../types/RequestHandler";
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: IRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            next(err);
        });
    };
}