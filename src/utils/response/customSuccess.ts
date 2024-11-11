import { response, Response } from "express";
import logger from "utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line func-names
response.customSuccess = function (
  httpStatusCode: number,
  message: string,
  data: any = null,
): Response {
  logger.info(message);
  return this.status(httpStatusCode).json({ message, data });
};
