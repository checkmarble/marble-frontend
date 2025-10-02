import { defineConfig, devices } from '@playwright/test';

import setup from './e2e/setup';

await setup();

export default defineConfig({
  testDir: './e2e',
  reporter: 'html',
  fullyParallel: true,
  workers: 4,
  use: {
    headless: !process.env['PW_DEBUG'],
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 250,
    },
  },
  projects: [
    {
      name: 'auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'auth.spec.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth.json',
      },
      testMatch: /.spec.ts/,
      testIgnore: 'auth.spec.ts',
      dependencies: ['auth'],
    },
  ],
  webServer: {
    command: 'bun run -F app-builder dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    env: {
      ENV: 'development',
      NODE_ENV: 'development',
      SESSION_SECRET: 'secret',
      SESSION_MAX_AGE: '43200',
      MARBLE_API_URL: `http://localhost:${process.env['API_PORT']}`,
      TEST_FIREBASE_AUTH_EMULATOR_HOST: `localhost:${process.env['FIREBASE_PORT']}`,
    },
  },
});
