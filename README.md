# SWISH! GM GraphQL Server

## Description

The GraphQL server used to access SWISH! GM data

## Getting Started

### Environment Variables

Specific environment variables are needed to successfully run, deploy or test the SWISH! GM GraphQL server. These should be saved in a `.env` file in the service's root directory.

| Variable               | Description                                         |
|------------------------|-----------------------------------------------------|
| `PROD_URL`             | URL of the production website                       |
| `LOCALHOST`            | URL for the localhost                               |
| `GRAPHQL_PORT`         | Port on localhost used to host the GraphQL server   |
| `ACCESS_TOKEN_SECRET`  | String used to sign the authorization ccess token   |
| `REFRESH_TOKEN_SECRET` | String used to sign the authorization refresh token |
| `MAILGUN_API_KEY`      | API key to send email with Mailgun                  |
| `MAILGUN_DOMAIN`       | Domain to send email with Mailgun                   |

## Usage

### Running Locally

- A PostgreSQL server must be running on `localhost:5432`
- In separate terminal tabs:
  1. Run `redis-server` to start the cache server
  2. Run `yarn start` to start the GraphQL server on `http://localhost:4000/graphql`

### Deployment Instructions

## Development Notes

- Must run `yarn gen-schema-types` after changing any entity's schema to re-generate TypeScript types stored in `src/types/schema.d.ts`

### Testing 

In separate terminal tabs
  1. Run `yarn test-server` to start the test database
  2. Run `yarn test` to run the tests

