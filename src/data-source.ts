import "reflect-metadata";

import { DataSource, DataSourceOptions } from "typeorm";

import { User } from "./entity/User";

let appDataSource;

const prodOptions: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "",
  database: "swish-gm-graphql",
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
};

if (process.env.NODE_ENV === "test") {
  appDataSource = new DataSource({
    ...prodOptions,
    database: "swish-gm-graphql-test",
    dropSchema: true,
  });
} else {
  appDataSource = new DataSource(prodOptions);
}

export const AppDataSource = appDataSource;