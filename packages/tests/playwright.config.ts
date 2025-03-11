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
    }
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
    command: 'pnpm --filter app-builder run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    env: {
      ENV: 'development',
      NODE_ENV: 'development',
      SESSION_SECRET: 'secret',
      SESSION_MAX_AGE: '43200',
      MARBLE_APP_URL: 'http://localhost:3000',
      MARBLE_API_URL_SERVER: `http://localhost:${process.env['API_PORT']}`,
      MARBLE_API_URL_CLIENT: `http://localhost:${process.env['API_PORT']}`,
      FIREBASE_AUTH_EMULATOR_HOST: `localhost:${process.env['FIREBASE_PORT']}`,
      FIREBASE_API_KEY: 'dummy',
      FIREBASE_PROJECT_ID: 'test-project',
    },
  },
});
