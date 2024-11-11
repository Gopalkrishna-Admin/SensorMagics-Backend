export type ErrorResponse = {
  errorType: ErrorType;
  errorMessage: string;
  errors: string[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorRaw: any;
  errorsValidation: ErrorValidation[] | null;
  stack?: string;
};

export type ErrorType = "General" | "Raw" | "Validation" | "Unauthorized";

export type ErrorValidation = { [key: string]: string };
