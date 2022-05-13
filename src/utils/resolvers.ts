import * as express from "express";
import Redis from "ioredis";
import * as jwt from "jsonwebtoken";

import { User } from "../entity/User";
import {
  AccessTokenData,
  GraphQLResponse,
  RefreshTokenData,
  Resolver,
  Tokens,
} from "../types/resolver";

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

export const clearTokens = (req: express.Request, res: express.Response) => {
  req.access = undefined;
  return { req, res };
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

export const responseSuccessful = GraphQLResponse(true);

export const responseErrors = {
  authorization: {
    RequireLogin: {
      type: "login",
      message: "Logging in is required to view this page",
    },
  },
  changePassword: {
    InvalidKey: {
      type: "key",
      message: "Invalid key to change password",
    },
  },
  graphQL: {
    MissingInput: {
      type: "input",
      message: "Missing input values",
    },
  },
  loginUser: {
    InvalidCredentials: {
      type: "login",
      message: "Invalid login credentials",
    },
    MustConfirmEmail: {
      type: "login",
      message: "Must confirm email before logging in",
    },
  },
  logout: {
    UserNotLoggedIn: {
      type: "logout",
      message: "User not logged in",
    },
  },
  registerUser: {
    EmailExists: {
      type: "email",
      message: "User with email address already exists",
    },
    UsernameExists: {
      type: "username",
      message: "User with username already exists",
    },
  },
  sendForgotPasswordEmail: {
    EmailDoesNotExist: {
      type: "email",
      message: "User with email address does not exist",
    },
  },
};
