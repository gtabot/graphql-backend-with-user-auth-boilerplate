import { GraphQLResponse } from "../types/resolver";

export const responseSuccessful = GraphQLResponse(true);

export const errors = {
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
  requireLogin: {
    LoginRequired: {
      type: "login",
      message: "Must be logged in to access",
    },
    MissingUser: {
      type: "user",
      message: "Can not find user",
    },
  },
  sendForgotPasswordEmail: {
    EmailDoesNotExist: {
      type: "email",
      message: "User with email address does not exist",
    },
  },
};