import "reflect-metadata";

import { DataSource, DataSourceOptions } from "typeorm";

import { User } from "./entity/User";

let appDataSource;

// TODO: configure PostgreSQL databases

const prodOptions: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "",
  database: "database",
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
};

if (process.env.NODE_ENV === "test") {
  appDataSource = new DataSource({
    ...prodOptions,
    database: "test",
    dropSchema: true,
  });
} else {
  appDataSource = new DataSource(prodOptions);
}

export const AppDataSource = appDataSource;
