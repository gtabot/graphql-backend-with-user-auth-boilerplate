# GraphQL Backend Server with User Authorization

## Description

This project serves as a boilerplate template for a GraphQL backend server with user authentication.

## Getting Started

### Installation

Run `yarn install` to install the dependency packages into the `node_modules` folder.

### Environment Variables

A local `.env` file is needed to run or test the server. The file must be created and needs to  contain the following variables:

| Variable               | Description                                         |
|------------------------|-----------------------------------------------------|
| `PROD_URL`             | URL of the production website                       |
| `LOCALHOST`            | URL for the localhost                               |
| `GRAPHQL_PORT`         | Port on localhost used to host the GraphQL server   |
| `ACCESS_TOKEN_SECRET`  | String used to sign the authorization ccess token   |
| `REFRESH_TOKEN_SECRET` | String used to sign the authorization refresh token |

### Sample `.env` file

```
PROD_URL="http://www.domain.com"
LOCALHOST="http://127.0.0.1"
GRAPHQL_PORT=4000
ACCESS_TOKEN_SECRET="tZ)`{P:iysP89oG'.{Qt<N}db`*Q={"
REFRESH_TOKEN_SECRET="7w5|yH}+t/^FgG_=h^3bi@w?w1,c;E"
```

## Usage

### Running Locally

- A PostgreSQL server must be running on `localhost:5432`
- In separate terminal tabs:
  1. Run `redis-server` to start the redis server
  2. Run `yarn start` to start the GraphQL server on `http://localhost:4000/graphql`

## Development Notes

- Must run `yarn gen-schema-types` after changing any entity's schema to re-generate TypeScript types stored in `src/types/schema.d.ts`

### Testing 

In separate terminal tabs
  1. Run `redis-server` to start the redis server
  2. Run `yarn test-server` to start the test database
  3. Run `yarn test` to run the tests

### Jest Tests
```
Register User 
  ✓ Successful registration
  ✓ Storing registration data correctly
  ✓ There's only 1 user with registered email
  ✓ There's only 1 user with registered username
  ✓ Password hash correctly verifies the password
  ✓ Cannot create another user with same email
  ✓ Cannot create another user with same username
Confirm User
  ✓ Confirm URL link works
  ✓ Visiting confirm URL sets user.confirm to true
  ✓ Visiting confirm URL removes confirm code from database
  ✓ Bad confirm codes do not confirm user
Login User
  ✓ Invalid username login will fail
  ✓ Invalid password login will fail
  ✓ Unconfirmed user login will fail
  ✓ Successful user login
  ✓ Can get current user if logged in
  ✓ Successful user log out
  ✓ Cannot get current user if logged out
  ✓ Across multiple clients, can login and get the current user
  ✓ "Logout all" removes all device IDs
Forgot Password
  ✓ Successful send of forgotten password email
  ✓ Valid forgot password key changes user's password
  ✓ Invalid forgot password key does not change user's password
```
