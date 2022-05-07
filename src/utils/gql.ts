const getCurrentUser = `
query {
  getCurrentUser {
    id
    username
  }
}`;

const changePassword = (username: string, newPassword: string, key: string) => `
mutation {
  changePassword(username: "${username}", newPassword: "${newPassword}", key: "${key}") {
    success
    errors {
      type
      message
    }
  }
}`;

const loginUser = (
  usernameOrEmail: string,
  password: string,
  deviceId: string
) => `
mutation {
  loginUser(usernameOrEmail: "${usernameOrEmail}", password: "${password}", deviceId: "${deviceId}") {
    success
    errors {
      type
      message
    }
    data
  }
}`;

const logoutAll = `
mutation {
  logoutAll {
    success
    errors {
      type
      message
    }
  }
}`;

const logoutUser = `
mutation {
  logoutUser {
    success
    errors {
      type
      message
    }
  }
}`;

const registerUser = (email: string, username: string, password: string) => `
mutation {
  registerUser(email: "${email}", username: "${username}", password: "${password}") {
    success
    errors {
      type
      message
    }
  }
}`;

const sendForgotPasswordEmail = (email: string) => `
mutation {
  sendForgotPasswordEmail(email: "${email}") {
    success
    errors {
      type
      message
    }
  }
}`;

export const graphqlFuncs = {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutAll,
  logoutUser,
  registerUser,
  sendForgotPasswordEmail,
};
