import * as express from "express";
import Redis from "ioredis";

export type AccessTokenData = {
  userId: string;
  deviceId: string;
};

export type RefreshTokenData = {
  userId: string;
  deviceId: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export function ProjectResponse(
  success: boolean,
  errors: { type: string; message: string }[] = [],
  data: string = ""
): GQL.IProjectResponse {
  return {
    __typename: "ProjectResponse",
    success,
    errors: errors.map((error) => {
      return {
        __typename: "ProjectError",
        ...error,
      };
    }),
    data,
  };
}

export type Resolver = (
  parent: any,
  args: any,
  context: {
    req: express.Request;
    res: express.Response;
    redis: Redis;
    graphQLHost: string;
  },
  info: any
) => any;

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
