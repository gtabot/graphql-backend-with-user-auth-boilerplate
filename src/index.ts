import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from "@graphql-tools/schema";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import "dotenv/config";
import * as express from "express";
import jwt from "jsonwebtoken";
import { join } from "path";
import "reflect-metadata";

import { AppDataSource } from "./data-source";
import User from "./entity/User";
import { resolvers } from "./resolvers";
import { AccessTokenData } from "./types/resolver";
import { confirmPrefix, redis } from "./utils/redis";
import { refreshTokens, setTokens } from "./utils/resolvers";

AppDataSource.initialize();

const schema = loadSchemaSync(join(__dirname, "schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

const setTokensMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const accessToken = req.headers["x-access-token"];
  req.access = undefined;
  if (accessToken) {
    try {
      const access = jwt.verify(
        accessToken as string,
        `${process.env.ACCESS_TOKEN_SECRET}`
      ) as AccessTokenData;
      req.access = access;
    } catch (err) {
      const refreshToken = req.headers["x-refresh-token"];
      if (!refreshToken) {
        next();
        return;
      }
      const refreshed = await refreshTokens(refreshToken as string);
      if (!refreshed) {
        next();
        return;
      }
      setTokens(req, res, refreshed.accessToken, refreshed.refreshToken);
    }
  }
  next();
};

const app = express();

app.set("trust proxy", process.env.NODE_ENV !== "production");

app.use(setTokensMiddleware);

const apolloServer = new ApolloServer({
  schema: schemaWithResolvers,
  context: ({ req, res }) => {
    const graphQLHost = `${process.env.LOCALHOST}:${process.env.GRAPHQL_PORT}/graphql`;
    return { req, res, redis, graphQLHost };
  },
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

apolloServer
  .start()
  .then(() => apolloServer.applyMiddleware({ app, cors: false }));

app.get("/confirm/:code", async (request, response) => {
  const { code } = request.params;
  const redisKey = `${confirmPrefix}${code}`;
  const userId = await redis.get(redisKey);
  if (userId) {
    await User.update({ id: userId }, { confirmed: true });
    await redis.del(redisKey);
    response.status(200);
    response.send();
  } else {
    response.status(400);
    response.send();
  }
});

app.listen(parseInt(`${process.env.GRAPHQL_PORT}`, 10), () => {
  console.log(
    `Running a GraphQL API server at http://localhost:${process.env.GRAPHQL_PORT}/graphql`
  );
});
