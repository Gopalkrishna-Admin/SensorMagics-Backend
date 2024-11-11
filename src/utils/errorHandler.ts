import { NextFunction, Request, Response } from "express";
import { CustomError } from "./response/custom-error/CustomError";
import logger from "./logger";

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);
  return res.status(err.HttpStatusCode).json(err.JSON);
};
