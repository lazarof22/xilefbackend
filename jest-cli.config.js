/**
 * Configuración Jest para las specs de la CLI de firma (`cli/`).
 *
 * La config principal de Jest (package.json) usa `rootDir: "src"`, de modo que
 * las specs de `cli/` no se descubren con `npm test`. Esta config dedicada
 * cubre `cli/` sin tocar la config principal, permitiendo ejecutar la CLI con
 * `npm run test:cli` o `npx jest --config jest-cli.config.js`.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'cli/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['cli/**/*.(t|j)s'],
  coverageDirectory: './coverage-cli',
  testEnvironment: 'node',
};
