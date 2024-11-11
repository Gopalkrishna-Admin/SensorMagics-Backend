import { IDevice, IUser } from "types/mongodb";
import { JwtPayload } from "../JwtPayload";

declare global {
  namespace Express {
    export interface Request {
      jwtPayload: JwtPayload;
      user?: IUser;
      device?: IDevice;
      language: "Language";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: any;
    }
    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customSuccess(
        httpStatusCode: number,
        message: string,
        data?: any,
      ): Response;
    }
  }
}
