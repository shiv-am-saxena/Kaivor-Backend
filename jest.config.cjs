const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    testMatch: ['**/tests/**/*.test.ts'],
};
