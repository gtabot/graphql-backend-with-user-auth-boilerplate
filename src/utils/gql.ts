const getCurrentUser = `
  query {
    getCurrentUser {
      id
      username
    }
  }
`;

const changePassword = `
  mutation ChangePassword (
    $username: String!,
    $newPassword: String!,
    $key: String!
  ) {
    changePassword(
      username: $username,
      newPassword: $newPassword,
      key: $key
    ) {
      success
      errors {
        type
        message
      }
    }
  }
`;

const loginUser = `
  mutation LoginUser(
    $usernameOrEmail: String!
    $password: String!
    $deviceId: String!
  ) {
    loginUser(
      usernameOrEmail: $usernameOrEmail
      password: $password
      deviceId: $deviceId
    ) {
      success
      errors {
        type
        message
      }
      data
    }
  }
`;

const logoutAll = `
  mutation {
    logoutAll {
      success
      errors {
        type
        message
      }
    }
  }
`;

const logoutUser = `
  mutation {
    logoutUser {
      success
      errors {
        type
        message
      }
    }
  }
`;

const registerUser = `
  mutation RegisterUser(
    $email: String!
    $username: String!
    $password: String!
  ) {
    registerUser(email: $email, username: $username, password: $password) {
      success
      errors {
        type
        message
      }
    }
  }
`;

const sendForgotPasswordEmail = `
  mutation SendForgotPasswordEmail($email: String!) {
    sendForgotPasswordEmail(email: $email) {
      success
      errors {
        type
        message
      }
    }
  }
`;

export const graphqlFuncs = {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutAll,
  logoutUser,
  registerUser,
  sendForgotPasswordEmail,
};
