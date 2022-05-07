# GraphQL Backend Server with User Authorization

## Description

This project serves as a boilerplate template for a GraphQL backend server with user authentication.

## Getting Started

### Environment Variables

A local `.env` file is needed to run or test the server. The file should contain the following variables:

Specific environment variables are needed to successfully run, deploy or test the SWISH! GM GraphQL server. These should be saved in a `.env` file in the service's root directory.

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
  1. Run `redis-server` to start the cache server
  2. Run `yarn start` to start the GraphQL server on `http://localhost:4000/graphql`

## Development Notes

- Must run `yarn gen-schema-types` after changing any entity's schema to re-generate TypeScript types stored in `src/types/schema.d.ts`

### Testing 

In separate terminal tabs
  1. Run `yarn test-server` to start the test database
  2. Run `yarn test` to run the tests

