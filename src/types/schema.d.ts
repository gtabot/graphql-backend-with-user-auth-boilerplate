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
  }

  /**
   *  Mutations
   */
  interface IMutation {
    __typename: 'Mutation';
    changePassword: IGraphQLResponse | null;
    loginUser: IGraphQLResponse | null;
    logoutAll: IGraphQLResponse | null;
    logoutUser: IGraphQLResponse | null;
    registerUser: IGraphQLResponse | null;
    sendForgotPasswordEmail: IGraphQLResponse | null;
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

  interface IGraphQLResponse {
    __typename: 'GraphQLResponse';
    success: boolean;
    errors: Array<ISwishError> | null;
    data: string | null;
  }

  /**
   *  Responses
   */
  interface ISwishError {
    __typename: 'SwishError';
    type: string;
    message: string;
  }
}

// tslint:enable
