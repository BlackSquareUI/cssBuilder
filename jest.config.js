module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts", "!src/app.ts"
    ],
    coveragePathIgnorePatterns: [
        "coverage",
    ],
};