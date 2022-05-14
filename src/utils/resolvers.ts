import * as express from "express";
import * as jwt from "jsonwebtoken";

import { User } from "../entity/User";
import {
  AccessTokenData,
  ProjectResponse,
  RefreshTokenData,
  Tokens,
} from "../types/resolver";
import { errors } from "./responses";

/* How to use checkLoggedIn:

const loginCheck = await checkLoggedIn(req);
if (!loginCheck.loggedIn) return loginCheck.result as GQL.IProjectResponse;
const user = loginCheck.result as User;

*/
export const checkLoggedIn = async (req: Express.Request) => {
  if (process.env.NODE_ENV === "production") {
    if (!req.access || !req.access.userId)
      return {
        loggedIn: false,
        result: ProjectResponse(false, [
          errors.requireLogin.LoginRequired,
        ]),
      };
    const user = await User.findOne({ where: { id: req.access.userId } });
    if (!user)
      return {
        loggedIn: false,
        result: ProjectResponse(false, [
          errors.requireLogin.MissingUser,
        ]),
      };
    return { loggedIn: true, result: user };
  } else {
    const user = (await User.find())[0];
    return { loggedIn: true, result: user };
  }
};

export const clearTokens = (req: express.Request, res: express.Response) => {
  req.access = undefined;
  return { req, res };
};

export const createTokens = async (user: User, deviceId: string) => {
  const accessData: AccessTokenData = {
    userId: user.id,
    deviceId,
  };
  const accessToken = jwt.sign(
    accessData,
    `${process.env.ACCESS_TOKEN_SECRET}`,
    {
      expiresIn: "1m",
    }
  );
  const refreshData: RefreshTokenData = {
    userId: user.id,
    deviceId,
  };
  const refreshToken = jwt.sign(
    refreshData,
    `${process.env.REFRESH_TOKEN_SECRET}`,
    {
      expiresIn: "7d",
    }
  );
  return Promise.all([accessToken, refreshToken]);
};


export const refreshTokens = async (
  refreshToken: string
): Promise<Tokens | null> => {
  const refresh = jwt.verify(
    refreshToken,
    `${process.env.REFRESH_TOKEN_SECRET}`
  ) as RefreshTokenData;
  if (!refresh) return null;
  const user = await User.findOne({ where: { id: refresh.userId } });
  if (!user) return null;
  const [newAccessToken, newRefreshToken] = await createTokens(
    user,
    refresh.deviceId
  );
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const setTokens = (
  req: express.Request,
  res: express.Response,
  accessToken: string,
  refreshToken: string
) => {
  res.set("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
  res.set("x-access-token", accessToken);
  res.set("x-refresh-token", refreshToken);
  const access = jwt.verify(
    accessToken as string,
    `${process.env.ACCESS_TOKEN_SECRET}`
  ) as AccessTokenData;
  req.access = access;
  return { req, res };
};
