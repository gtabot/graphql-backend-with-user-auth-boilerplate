import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

import { User } from "../entity/User";
import { GraphQLResponse } from "../types/resolver";
import { confirmPrefix, passwordPrefix } from "./redis";

// tslint:disable-next-line:no-var-requires
const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

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
  return `${url}/change-password/${key}`;
};

export const sendConfirmEmail = async (
  user: User,
  url: string
): Promise<GQL.IGraphQLResponse> => {
  try {
    await mailgun.messages().send({
      from: "SWISH! GM <confirm@swish-gm.com>",
      to: user.email,
      subject: "Confirm email address for SWISH! GM registration",
      html: `
  <p>${user.username},</p>
  <p>Thank you for signing up for SWISH! GM. To get started, you must first confirm your email address by clicking <a href="${url}">here</a> or copying and pasting the url below:</p>
  <p>${url}</p>
  <p>SWISH! GM</p>`,
    });
    return GraphQLResponse(true);
  } catch (err) {
    console.log(err);
    return GraphQLResponse(false, [{ type: err.type, message: err.message }]);
  }
};

export const sendForgotPasswordEmail = async (
  user: User,
  url: string
): Promise<GQL.IGraphQLResponse> => {
  try {
    await mailgun.messages().send({
      from: "SWISH! GM <forgotpassword@swish-gm.com>",
      to: user.email,
      subject: "Reset password for SWISH! GM",
      html: `
  <p>${user.username},</p>
  <p>It seems like you forgot your password. Click <a href="${url}">here</a> to reset your password or copy and paste the url below:</p>
  <p>${url}</p>
  <p>SWISH! GM</p>`,
    });
    return GraphQLResponse(true);
  } catch (err) {
    console.log(err);
    return GraphQLResponse(false, [{ type: err.type, message: err.message }]);
  }
};
