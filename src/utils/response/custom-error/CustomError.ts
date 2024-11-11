/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorType, ErrorValidation, ErrorResponse } from "./types";

export class CustomError extends Error {
  private httpStatusCode: number;
  private errorType: ErrorType;
  private errors: string[] | null;
  private errorRaw: any;
  private errorsValidation: ErrorValidation[] | null;

  constructor(
    httpStatusCode: number,
    errorType: ErrorType,
    message: string,
    errors: string[] | null = null,
    errorRaw: any = null,
    errorsValidation: ErrorValidation[] | null = null,
  ) {
    super(errorRaw ? errorRaw.message : message);

    this.name = this.constructor.name;

    this.httpStatusCode = httpStatusCode;
    this.errorType = errorType;
    this.errors = errors;
    this.errorRaw = errorRaw;
    this.errorsValidation = errorsValidation;

    if (errorRaw) this.stack = errorRaw.stack;
  }

  get HttpStatusCode() {
    return this.httpStatusCode;
  }

  get JSON(): ErrorResponse {
    return {
      errorType: this.errorType,
      errorMessage: this.message,
      errors: this.errors,
      errorRaw: ["localhost", "dev"].includes(
        process.env.NODE_ENV || "localhost",
      )
        ? this.errorRaw
        : {},
      errorsValidation: this.errorsValidation,
      stack: ["localhost", "dev"].includes(process.env.NODE_ENV || "localhost")
        ? this.stack
        : "",
    };
  }
}
