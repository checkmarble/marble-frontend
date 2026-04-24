import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

import setup from './e2e/setup';

await setup();

type Mode = 'dev' | 'ci';

export function createConfig(mode: Mode): PlaywrightTestConfig {
  const isDev = mode === 'dev';

  return defineConfig({
    testDir: './e2e',
    reporter: 'html',
    fullyParallel: true,
    // In dev, Vite's single-process dev server is the bottleneck; concurrent workers
    // serialize on it and slow everything down. In prod, we serve bundled chunks
    // and parallelism scales with cores.
    workers: isDev ? 1 : 4,
    use: {
      headless: !process.env['PW_DEBUG'],
      baseURL: 'http://localhost:3000',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      ...(isDev ? { launchOptions: { slowMo: 250 } } : {}),
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
      // Skip the Bun workspace wrapper in prod — it elides subprocess stderr,
      // which makes startup failures invisible.
      command: isDev ? 'bun run -F app-builder dev' : 'node ../app-builder/.output/server/index.mjs',
      url: 'http://localhost:3000',
      reuseExistingServer: isDev,
      timeout: isDev ? 60_000 : 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ENV: 'development',
        NODE_ENV: isDev ? 'development' : 'production',
        SESSION_SECRET: 'SOMETHING_LIKE_A_LONG_SESSION_SECRET_KEY',
        SESSION_MAX_AGE: '43200',
        MARBLE_API_URL: `http://localhost:${process.env['API_PORT']}`,
        TEST_FIREBASE_AUTH_EMULATOR_HOST: `localhost:${process.env['FIREBASE_PORT']}`,
      },
    },
  });
}
