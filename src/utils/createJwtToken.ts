import { SessionMapping, User } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "types/mongodb";
import { JwtDevicePayload, JwtUserPayload } from "../types/jwtPayload";
import { CustomError } from "./response/custom-error/CustomError";

export const createAccessToken = (payload: JwtUserPayload): string =>
  jwt.sign(payload, process.env.JWT_USER_SECRET_KEY as string, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
    algorithm: "HS512",
  });

export const createPasswordResetToken = (payload: JwtUserPayload): string =>
  jwt.sign(payload, process.env.JWT_USER_SECRET_KEY as string, {
    expiresIn: 600,
    algorithm: "HS512",
  });

export const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.get("AccessToken");
  if (!accessToken) {
    const customError = new CustomError(
      400,
      "General",
      "AccessToken header not provided"
    );
    return next(customError);
  }
  const token = accessToken.split(" ")[1];
  try {
    const jwtPayload = jwt.verify(
      token,
      process.env.JWT_USER_SECRET_KEY as string
    ) as JwtUserPayload;
    req.jwtPayload = jwtPayload;
    const userDetails: IUser | null = await User.findOne({
      id: jwtPayload.id,
    });

    if (!userDetails) {
      const customError = new CustomError(
        401,
        "Raw",
        "JWT error",
        null,
        "No User with the ID found"
      );
      return next(customError);
    } else {
      req.user = userDetails;
    }
    const sessions = await SessionMapping.find({
      userId: userDetails.id,
      isValid: true
    });
    const sessionToken = sessions.map((session) => session.jwt);
    if (!sessionToken.includes(token)) {
      const customError = new CustomError(
        401,
        "Raw",
        "JWT error",
        null,
        "Please login again"
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(401, "Raw", "JWT error", null, err);
    return next(customError);
  }
  return next();
};

export const checkAdminJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.get("AccessToken");
  if (!accessToken) {
    const customError = new CustomError(
      400,
      "General",
      "AccessToken header not provided"
    );
    return next(customError);
  }
  const token = accessToken.split(" ")[1];
  try {
    const jwtPayload = jwt.verify(
      token,
      process.env.JWT_USER_SECRET_KEY as string
    ) as JwtUserPayload;
    req.jwtPayload = jwtPayload;
    //TODO:will comment off once all changes are done
    // if(jwtPayload.role !== ERole.ADMIN){
    //   const customError = new CustomError(
    //     401,
    //     "Raw",
    //     "JWT error",
    //     null,
    //     "No User with the ID found"
    //   );
    //   return next(customError);
    // }
    const userDetails: IUser | null = await User.findOne({
      id: jwtPayload.id,
    });

    if (!userDetails) {
      const customError = new CustomError(
        401,
        "Raw",
        "JWT error",
        null,
        "No User with the ID found"
      );
      return next(customError);
    } else {
      req.user = userDetails;
    }
    const sessions = await SessionMapping.find({
      userId: userDetails.id,
      isValid: true
    });
    const sessionToken = sessions.map((session) => session.jwt);
    if (!sessionToken.includes(token)) {
      const customError = new CustomError(
        401,
        "Raw",
        "JWT error",
        null,
        "Please login again"
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(401, "Raw", "JWT error", null, err);
    return next(customError);
  }
  return next();
};
