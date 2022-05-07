import { AppDataSource } from "../src/data-source";

export const beforeAllTests = () => AppDataSource.initialize();

export const afterAllTests = () => AppDataSource.destroy();
