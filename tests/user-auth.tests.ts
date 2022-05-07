import * as bcrypt from "bcryptjs";
import "dotenv/config";
import { GraphQLClient, request } from "graphql-request";
import fetch from "node-fetch";

import { User } from "../src/entity/User";
import { Tokens } from "../src/types/resolver";
import { createConfirmURL, createForgotPasswordURL } from "../src/utils/email";
import { graphqlFuncs } from "../src/utils/gql";
import { accessPrefix, redis } from "../src/utils/redis";
import { responseErrors } from "../src/utils/resolvers";
import { afterAllTests, beforeAllTests } from "./test-globals";

const graphqlHost = `${process.env.LOCALHOST}:${process.env.GRAPHQL_PORT}/graphql`;

const client = new GraphQLClient(graphqlHost);

const responseSuccessful = { success: true, errors: [] };

const mock = {
  userId: "",
  email: "user@email.com",
  username: "username1",
  password: "pass1234",
  deviceId: "00000000-89ABCDEF-01234567-89ABCDEF",
};

const mock2 = {
  userId: "",
  email: "user2@email.com",
  username: "username2",
  password: "pass5678",
  deviceId: "00000000-00000000-01234567-89ABCDEF",
};

const redisAccessKey = (userId: string) => `${accessPrefix}${userId}`;

const getDeviceIds = (userId: string) =>
  redis.lrange(redisAccessKey(userId), 0, -1);

beforeAll(beforeAllTests);

afterAll(afterAllTests);

describe("Register User", () => {
  let user: any;

  test("Successful registration", async () => {
    const response = await request(
      graphqlHost,
      graphqlFuncs.registerUser(mock.email, mock.username, mock.password)
    );
    expect(response.registerUser).toEqual(responseSuccessful);
  });

  test("Storing registration data correctly", async () => {
    user = await User.findOne({ where: { email: mock.email } });
    expect(user.email).toEqual(mock.email);
    expect(user.username).toEqual(mock.username);
    expect(user.passwordHash).not.toEqual(mock.password);
    mock.userId = user.id;
  });

  test("There's only 1 user with registered email", async () => {
    const users = await User.find({ where: { email: mock.email } });
    expect(users).toHaveLength(1);
  });

  test("There's only 1 user with registered username", async () => {
    const users = await User.find({ where: { username: mock.username } });
    expect(users).toHaveLength(1);
  });

  test("Password hash correctly verifies the password", async () => {
    expect(bcrypt.compareSync(mock.password, user.passwordHash)).toBe(true);
  });

  test("Cannot create another user with same email", async () => {
    const response = await request(
      graphqlHost,
      graphqlFuncs.registerUser(mock.email, mock2.username, mock.password)
    );
    expect(response.registerUser).toEqual({
      success: false,
      errors: [responseErrors.registerUser.EmailExists],
    });
  });

  test("Cannot create another user with same username", async () => {
    const response = await request(
      graphqlHost,
      graphqlFuncs.registerUser(mock2.email, mock.username, mock.password)
    );
    expect(response.registerUser).toEqual({
      success: false,
      errors: [responseErrors.registerUser.UsernameExists],
    });
  });
});

describe("Confirm User", () => {
  let url: string;
  let code: string;

  test("Confirm URL link works", async () => {
    const user = await User.findOne({ where: { email: mock.email } });
    if (!user) return expect(user).not.toBeNull();
    url = await createConfirmURL(
      `${process.env.LOCALHOST}:${process.env.GRAPHQL_PORT}`,
      user.id,
      redis
    );
    const response = await fetch(url);
    expect(response.status).toBe(200);
  });

  test("Visiting confirm URL sets user.confirm to true", async () => {
    const user = await User.findOne({ where: { email: mock.email } });
    if (!user) return expect(user).not.toBeNull();
    expect(user.confirmed).toBe(true);
  });

  test("Visiting confirm URL removes confirm code from database", async () => {
    const parts = url.split("/");
    code = parts[parts.length - 1];
    const value = await redis.get(code);
    expect(value).toBeNull();
  });

  test("Bad confirm codes do not confirm user", async () => {
    const response = await fetch(url);
    expect(response.status).toBe(400);
    const invalidCode = "00000000";
    const response2 = await fetch(
      `${process.env.LOCALHOST}:${process.env.GRAPHQL_PORT}/confirm/${invalidCode}`
    );
    expect(response2.status).toBe(400);
  });
});

describe("Login User", () => {
  let loggedInClient: GraphQLClient;

  test("Invalid username login will fail", async () => {
    const response = await client.request(
      graphqlFuncs.loginUser("wrongUser", mock.password, mock.deviceId)
    );
    expect(response.loginUser).toEqual({
      success: false,
      errors: [responseErrors.loginUser.InvalidCredentials],
      data: "",
    });
  });

  test("Invalid password login will fail", async () => {
    const response = await client.request(
      graphqlFuncs.loginUser(mock.username, "wrongPassword", mock.deviceId)
    );
    expect(response.loginUser).toEqual({
      success: false,
      errors: [responseErrors.loginUser.InvalidCredentials],
      data: "",
    });
  });

  test("Unconfirmed user login will fail", async () => {
    await client.request(
      graphqlFuncs.registerUser(mock2.email, mock2.username, mock2.password)
    );
    const response = await client.request(
      graphqlFuncs.loginUser(mock2.username, mock2.password, mock2.deviceId)
    );
    expect(response.loginUser).toEqual({
      success: false,
      errors: [responseErrors.loginUser.MustConfirmEmail],
      data: "",
    });
  });

  test("Successful user login", async () => {
    const beforeDeviceIds = await getDeviceIds(mock.userId);
    const response = await client.request(
      graphqlFuncs.loginUser(mock.username, mock.password, mock.deviceId)
    );
    const afterDeviceIds = await getDeviceIds(mock.userId);
    expect(afterDeviceIds?.length).toBe(beforeDeviceIds?.length + 1 || 1);
    expect(response.loginUser.success).toBe(true);
    const tokens: Tokens = JSON.parse(response.loginUser.data);
    loggedInClient = new GraphQLClient(graphqlHost, {
      headers: {
        "x-access-token": tokens.accessToken,
        "x-refresh-token": tokens.refreshToken,
      },
    });
  });

  test("Can get current user if logged in", async () => {
    const response = await loggedInClient.request(graphqlFuncs.getCurrentUser);
    expect(response.getCurrentUser).not.toBeNull();
    expect(response.getCurrentUser?.username).toBe(mock.username);
  });

  test("Successful user log out", async () => {
    const beforeDeviceIds = await getDeviceIds(mock.userId);
    const response = await loggedInClient.request(graphqlFuncs.logoutUser);
    const afterDeviceIds = await getDeviceIds(mock.userId);
    expect(response.logoutUser).toEqual(responseSuccessful);
    expect(afterDeviceIds.length).toBe(beforeDeviceIds.length - 1);
    expect(afterDeviceIds.includes(mock.deviceId)).toBe(false);
  });

  test("Cannot get current user if logged out", async () => {
    const response = await client.request(graphqlFuncs.getCurrentUser);
    expect(response.getCurrentUser).toBeNull();
  });

  test("Across multiple clients, can login and get the current user", async () => {
    const loginAndGetCurrentUser = async () => {
      let response;
      response = await client.request(
        graphqlFuncs.loginUser(mock.username, mock.password, mock.deviceId)
      );
      expect(response.loginUser.success).toBe(true);
      const tokens: Tokens = JSON.parse(response.loginUser.data);
      const loggedIn = new GraphQLClient(graphqlHost, {
        headers: {
          "x-access-token": tokens.accessToken,
          "x-refresh-token": tokens.refreshToken,
        },
      });
      response = await loggedIn.request(graphqlFuncs.getCurrentUser);
      expect(response.getCurrentUser?.username).toBe(mock.username);
      return [response, loggedIn];
    };
    let response1;
    let response2;
    [response1, loggedInClient] = await loginAndGetCurrentUser();
    [response2, loggedInClient] = await loginAndGetCurrentUser();
    expect(response1).toEqual(response2);
  });

  test('"Logout all" removes all device IDs', async () => {
    await loggedInClient.request(graphqlFuncs.logoutAll);
    const deviceIds = await redis.get(redisAccessKey(mock.userId));
    expect(deviceIds).toBeNull();
  });
});

describe("Forgot Password", () => {
  let key: string;

  test("Successful send of forgotten password email", async () => {
    const response = await client.request(
      graphqlFuncs.sendForgotPasswordEmail(mock2.email)
    );
    expect(response.sendForgotPasswordEmail).toEqual(responseSuccessful);
  });

  test("Valid forgot password key changes user's password", async () => {
    const url = await createForgotPasswordURL(
      `${process.env.LOCALHOST}:${process.env.GRAPHQL_PORT}`,
      mock.email,
      redis
    );
    const parts = url.split("/");
    key = parts[parts.length - 1];
    const response = await client.request(
      graphqlFuncs.changePassword(mock.username, mock2.password, key)
    );
    expect(response.changePassword).toEqual(responseSuccessful);
    const user = await User.findOne({ where: { username: mock.username } });
    if (!user) return expect(user).not.toBeNull();
    expect(bcrypt.compareSync(mock2.password, user.passwordHash)).toBe(true);
  });

  test("Invalid forgot password key does not change user's password", async () => {
    const checkPassword = async () => {
      const user = await User.findOne({ where: { username: mock.username } });
      if (!user) return expect(user).not.toBeNull();
      expect(response.changePassword).toEqual({
        success: false,
        errors: [responseErrors.changePassword.InvalidKey],
      });
      expect(bcrypt.compareSync(mock.password, user.passwordHash)).toBe(false);
    }
    let response = await client.request(
      graphqlFuncs.changePassword(mock.username, mock.password, key)
    );
    await checkPassword();
    const invalidKey = "00000000";
    response = await client.request(
      graphqlFuncs.changePassword(mock.username, mock.password, invalidKey)
    );
    await checkPassword();
  });
});
