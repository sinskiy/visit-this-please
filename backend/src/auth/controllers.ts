import { type NextFunction, type Request, type Response } from "express";
import { ErrorWithStatus } from "../lib/error.ts";

export function isUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new ErrorWithStatus("Unauthorized", 401);
  }

  next();
}
