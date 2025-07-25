import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const alias = pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' });

const unit: Config = {
  displayName: 'unit',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  clearMocks: true,
  moduleNameMapper: alias,
};

const e2e: Config = {
  displayName: 'e2e',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  moduleNameMapper: alias,
};

const config: Config = {
  projects: [unit, e2e],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
};

export default config;
