import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

import { User } from "../entity/User";
import { ProjectResponse } from "../types/resolver";
import { confirmPrefix, passwordPrefix } from "./redis";

export const createConfirmURL = async (
  url: string,
  userId: string,
  redis: Redis
): Promise<string> => {
  const code = uuidv4();
  await redis.set(`${confirmPrefix}${code}`, userId, "EX", 60 * 60 * 24 * 7); // 7 days
  return `${url}/confirm/${code}`;
};

export const createForgotPasswordURL = async (
  url: string,
  email: string,
  redis: Redis
): Promise<string> => {
  const key = uuidv4();
  await redis.set(`${passwordPrefix}${key}`, email, "EX", 60 * 20); // 20 minutes
  return `${url}/forgot-password/${key}`;
};

export const sendConfirmEmail = async (
  user: User,
  url: string
): Promise<GQL.IProjectResponse> => {
  // TODO: send confirm email
  console.log(`TODO: Send confirm email to ${user.email} with link ${url}`)
  return ProjectResponse(true);
};

export const sendForgotPasswordEmail = async (
  user: User,
  url: string
): Promise<GQL.IProjectResponse> => {
  // TODO: send forgot password email
  console.log(`TODO: Send forgot password email to ${user.email} with link ${url}`)
  return ProjectResponse(true);
};
