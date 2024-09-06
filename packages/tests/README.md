# Tests

The `marble-front/tests` package is designed to provide a comprehensive set of end-to-end tests for the Marble front-end application. By running these tests, developers can ensure that the front-end application is functioning correctly and that any changes or updates to the codebase do not introduce regressions or bugs.

> **Note:** The tests in this package are written using the [Playwright](https://playwright.dev/) testing framework.

## Getting Started

To get started with running the tests in this package, follow these steps:

1. Install Playwright (if you have not already done so):

   ```bash
   pnpm --filter tests exec playwright install
   ```

2. Create the test organisation (if it does not already exist):
   1. Open the backoffice application
   2. Create a new organisation with the name `e2e`. Do not forget to check "init with demo data"
   3. Create a new admin user on this org with the email `admin@e2e.com`
3. Start a local test environment:
   1. start the Firebase emulator suite
   2. start the backend normally
   3. start the front-end application normally
4. Run the tests using :
   1. the command `pnpm --filter tests test`, for cmd line "fast" run
   2. the command `pnpm --filter tests test:ui`, to open the browser and see the tests running

> **Note:** The tests in this package are designed to be run against a local test environment. Steps 2 and 3 are manual steps that will be automated in the future.

## Contributing

If you would like to contribute to the tests in this package, we recommend using the VS Code extension for Playwright to help you write and debug tests.
