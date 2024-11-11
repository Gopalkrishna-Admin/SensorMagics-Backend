
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/response/custom-error/CustomError";
import { sendEmail } from "utils/email";

export const sendEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { html,subject } = req.body;
  try {
    await sendEmail({from: "sender@sensormagics.com",html,subject,to:"sahilymenda@gmail.com"});
    return res.customSuccess(200, "Email sent successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      `Cant send email`,
      null,
      err
    );
    return next(customError);
  }
};