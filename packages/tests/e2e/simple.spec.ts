import { expect, test } from '@playwright/test';

test('Is logged in', async ({ page }) => {
  await page.goto('/scenarios');
  await expect(page.locator('nav').getByRole('link', { name: 'Scenarios' })).toBeVisible();
});
