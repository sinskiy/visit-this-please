/** @type {import('jest').Config} */
export default {
  modulePathIgnorePatterns: ["<rootDir>/e2e"],
  moduleNameMapper: {
    "\\.svg$": "<rootDir>/test/fileMock.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.tsx"],
  testEnvironment: "jsdom",
};
