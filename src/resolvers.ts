import * as bcrypt from "bcryptjs";

import { User } from "./entity/User";
import { GraphQLResponse, ResolverMap } from "./types/resolver";
import {
  createConfirmURL,
  createForgotPasswordURL,
  sendConfirmEmail,
  sendForgotPasswordEmail,
} from "./utils/email";
import { accessPrefix, passwordPrefix } from "./utils/redis";
import {
  clearTokens,
  createTokens,
  responseErrors,
  responseSuccessful,
  setTokens,
} from "./utils/resolvers";

export const resolvers: ResolverMap = {
  Query: {
    getCurrentUser: async (_, __, { req }) => {
      if (!req.access || !req.access.userId) return null;
      const user = await User.findOne({ where: { id: req.access.userId } });
      return user;
    },
  },

  Mutation: {
    changePassword: async (
      _,
      args: GQL.IChangePasswordOnMutationArguments,
      { redis }
    ): Promise<GQL.IGraphQLResponse> => {
      const { username, newPassword, key } = args;
      const redisKey = `${passwordPrefix}${key}`;
      const email = await redis.get(redisKey);
      if (!email)
        return GraphQLResponse(false, [
          responseErrors.changePassword.InvalidKey,
        ]);
      const newPasswordHash = await bcrypt.hash(newPassword, 16);
      await User.update({ email, username }, { passwordHash: newPasswordHash });
      await redis.del(redisKey);
      return responseSuccessful;
    },

    loginUser: async (
      _,
      args: GQL.ILoginUserOnMutationArguments,
      { req, res, redis }
    ): Promise<GQL.IGraphQLResponse> => {
      const { usernameOrEmail, password, deviceId } = args;
      let user;
      user = await User.findOne({ where: { username: usernameOrEmail } });
      if (!user)
        user = await User.findOne({ where: { email: usernameOrEmail } });
      if (!user)
        return GraphQLResponse(false, [
          responseErrors.loginUser.InvalidCredentials,
        ]);
      if (!user.confirmed)
        return GraphQLResponse(false, [
          responseErrors.loginUser.MustConfirmEmail,
        ]);
      if (!bcrypt.compareSync(password, user.passwordHash)) {
        return GraphQLResponse(false, [
          responseErrors.loginUser.InvalidCredentials,
        ]);
      } else {
        const [accessToken, refreshToken] = await createTokens(user, deviceId);
        setTokens(req, res, accessToken, refreshToken);
        await redis.lpush(`${accessPrefix}${user.id}`, deviceId);
        const data = { accessToken, refreshToken };
        return GraphQLResponse(true, [], JSON.stringify(data));
      }
    },

    logoutAll: async (
      _,
      __,
      { req, res, redis }
    ): Promise<GQL.IGraphQLResponse> => {
      if (req.access?.userId)
        await redis.del(`${accessPrefix}${req.access.userId}`);
      clearTokens(req, res);
      return responseSuccessful;
    },

    logoutUser: async (
      _,
      __,
      { req, res, redis }
    ): Promise<GQL.IGraphQLResponse> => {
      if (req.access?.userId && req.access?.deviceId)
        await redis.lrem(
          `${accessPrefix}${req.access.userId}`,
          0,
          req.access.deviceId
        );
      clearTokens(req, res);
      return responseSuccessful;
    },

    registerUser: async (
      _,
      args: GQL.IRegisterUserOnMutationArguments,
      { redis }
    ): Promise<GQL.IGraphQLResponse> => {
      const { email, username, password } = args;
      const usernameExists = await User.findOne({ where: { username } });
      if (usernameExists)
        return GraphQLResponse(false, [
          responseErrors.registerUser.UsernameExists,
        ]);
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists)
        return GraphQLResponse(false, [
          responseErrors.registerUser.EmailExists,
        ]);
      const passwordHash = await bcrypt.hash(password, 16);
      const user = await User.create({ email, username, passwordHash });
      await user.save();
      const confirmURL = await createConfirmURL(
        `${process.env.FRONT_END_URL}`,
        user.id,
        redis
      );
      if (process.env.NODE_ENV === "production")
        return sendConfirmEmail(user, confirmURL);
      else return GraphQLResponse(true);
    },

    sendForgotPasswordEmail: async (
      _,
      args: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ): Promise<GQL.IGraphQLResponse> => {
      const { email } = args;
      const user = await User.findOne({ where: { email } });
      if (!user)
        return GraphQLResponse(false, [
          responseErrors.sendForgotPasswordEmail.EmailDoesNotExist,
        ]);
      const forgotPasswordURL = await createForgotPasswordURL(
        `${process.env.FRONT_END_URL}`,
        user.id,
        redis
      );
      if (process.env.NODE_ENV === "production")
        return sendForgotPasswordEmail(user, forgotPasswordURL);
      else return GraphQLResponse(true);
    },
  },
};
