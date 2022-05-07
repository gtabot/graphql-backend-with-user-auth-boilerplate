/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/*.tests.ts"],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
};
