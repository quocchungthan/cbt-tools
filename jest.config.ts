import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
};

export default config;