import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

test('Initial login page', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('/sign-in');

  await expect(page).toHaveTitle('Marble');
  await expect(page.getByText('Great rules are built with the Right Tools')).toBeVisible();
});

test('Invalid username', async ({ page }) => {
  await page.goto('/sign-in');

  await page
    .getByRole('textbox')
    .and(page.locator('[name="credentials.email"]'))
    .fill('invalid@zorg.com');
  await page
    .getByRole('textbox')
    .and(page.locator('[name="credentials.password"]'))
    .fill('very-secret');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('No user account found for this address.')).toBeVisible();
});

test('Invalid password', async ({ page }) => {
  await page.goto('/sign-in');

  await page
    .getByRole('textbox')
    .and(page.locator('[name="credentials.email"]'))
    .fill('jbe@zorg.com');
  await page
    .getByRole('textbox')
    .and(page.locator('[name="credentials.password"]'))
    .fill('invalid');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('Wrong password.')).toBeVisible();
});

const authState = path.join(path.dirname(fileURLToPath(import.meta.url)), '../auth.json');

test('Authentication', async ({ page }) => {
  await page.goto('/sign-in');

  await page
    .getByRole('textbox')
    .and(page.locator('[name="credentials.email"]'))
    .fill('jbe@zorg.com');
  await page
    .getByRole('textbox')
    .and(page.locator('[name="credentials.password"]'))
    .fill('very-secret');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await page.waitForURL('/scenarios');

  await expect(page.locator('nav').getByRole('link', { name: 'Scenarios ' })).toBeVisible();

  await page.context().storageState({ path: authState, indexedDB: true });
});
