const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'CommonJS',
        moduleResolution: 'Node',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        paths: {
          '@gpower/db': [path.resolve(__dirname, '../db/src/index.ts')],
          '@prisma/client': [path.resolve(__dirname, '../db/node_modules/.prisma/client')],
        },
      },
      diagnostics: false,
    }],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@gpower/db$': path.resolve(__dirname, '../db/src/index.ts'),
    '^@gpower/shared$': path.resolve(__dirname, 'node_modules/@gpower/shared/dist/index.js'),
    '^@prisma/client$': path.resolve(__dirname, '../db/node_modules/.prisma/client'),
  },
};
