/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "@quramy/jest-prisma/environment",
    moduleNameMapper: {
        "@/(.*)": "<rootDir>/src/$1",
    },
};
