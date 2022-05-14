import { AppDataSource } from "../src/data-source";

export const beforeEachTestSuite = () => AppDataSource.initialize();

export const afterEachTestSuite = () => AppDataSource.destroy();
