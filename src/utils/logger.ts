/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import os from "os";
import winston, { format } from "winston";
import "winston-daily-rotate-file";

export const getTempDirForLogs = () => {
  const opsys = process.platform;
  let tmpDir;
  if (opsys?.startsWith("win")) {
    tmpDir = os.tmpdir();
  } else if (opsys === "linux" || opsys === "darwin") {
    tmpDir = "/tmp/nodelogs/";
  }
  console.log(`Using ${tmpDir} for Logging`);
  return tmpDir;
};
const logDirectory = getTempDirForLogs();
const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      level: "debug",
      filename: `${logDirectory}/debug-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new winston.transports.DailyRotateFile({
      level: "info",
      filename: `${logDirectory}/application-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new winston.transports.DailyRotateFile({
      level: "error",
      filename: `${logDirectory}/error-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      debugStdout: true,
    }),
  );
}

export default logger;
