import { Request, Response, NextFunction } from "express";

export interface IRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<void>|void;
}