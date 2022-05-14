// tslint:disable
// graphql typescript definitions

declare namespace GQL {
  interface IGraphQLResponseRoot {
    data?: IQuery | IMutation;
    errors?: Array<IGraphQLResponseError>;
  }

  interface IGraphQLResponseError {
    /** Required for all errors */
    message: string;
    locations?: Array<IGraphQLResponseErrorLocation>;
    /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
    [propName: string]: any;
  }

  interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  /**
   *  Queries
   */
  interface IQuery {
    __typename: 'Query';
    getCurrentUser: IUser | null;
  }

  /**
   *  Entities
   */
  interface IUser {
    __typename: 'User';
    id: string;
    username: string;
    email: string;
  }

  /**
   *  Mutations
   */
  interface IMutation {
    __typename: 'Mutation';
    changePassword: IProjectResponse | null;
    loginUser: IProjectResponse | null;
    logoutAll: IProjectResponse | null;
    logoutUser: IProjectResponse | null;
    registerUser: IProjectResponse | null;
    sendForgotPasswordEmail: IProjectResponse | null;
  }

  interface IChangePasswordOnMutationArguments {
    username: string;
    newPassword: string;
    key: string;
  }

  interface ILoginUserOnMutationArguments {
    usernameOrEmail: string;
    password: string;
    deviceId: string;
  }

  interface IRegisterUserOnMutationArguments {
    email: string;
    username: string;
    password: string;
  }

  interface ISendForgotPasswordEmailOnMutationArguments {
    email: string;
  }

  interface IProjectResponse {
    __typename: 'ProjectResponse';
    success: boolean;
    errors: Array<IProjectError> | null;
    data: string | null;
  }

  /**
   *  Responses
   */
  interface IProjectError {
    __typename: 'ProjectError';
    type: string;
    message: string;
  }
}

// tslint:enable
