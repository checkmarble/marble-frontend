import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

test('Initial login page', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('/sign-in-email?email=');

  await expect(page).toHaveTitle('Marble');
  await expect(page.getByText('Iterate. Improve. Automate.')).toBeVisible();
});

test('Invalid username', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByRole('textbox').and(page.locator('[name="credentials.email"]')).fill('invalid@zorg.com');
  await page.getByRole('textbox').and(page.locator('[name="credentials.password"]')).fill('very-secret');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('Invalid login credentials.')).toBeVisible();
});

test('Invalid password', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByRole('textbox').and(page.locator('[name="credentials.email"]')).fill('jbe@zorg.com');
  await page.getByRole('textbox').and(page.locator('[name="credentials.password"]')).fill('invalid');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('Invalid login credentials.')).toBeVisible();
});

const authState = path.join(path.dirname(fileURLToPath(import.meta.url)), '../auth.json');

test('Authentication', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByRole('textbox').and(page.locator('[name="credentials.email"]')).fill('jbe@zorg.com');
  await page.getByRole('textbox').and(page.locator('[name="credentials.password"]')).fill('very-secret');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await page.waitForURL('/detection/scenarios');

  await expect(page.locator('nav').getByRole('link', { name: 'Detection' })).toBeVisible();

  // First-login release-notes modal blocks every downstream spec by overlaying the page.
  // Pre-seed the snooze localStorage key (see VersionUpdateModalContainer.tsx) so the modal
  // never opens. Pre-seeding (vs awaiting the modal + clicking dismiss) avoids racing the
  // async version check, which doesn't always settle before storageState is captured.
  await page.evaluate(() => {
    localStorage.setItem(
      'version-snooze',
      JSON.stringify({ expiry: Date.now() + 365 * 24 * 60 * 60 * 1000, version: 'e2e' }),
    );
  });

  await page.context().storageState({ path: authState, indexedDB: true });
});
