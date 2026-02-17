import { expect, test } from '@playwright/test';

test('Is logged in', async ({ page }) => {
  await page.goto('/detection/scenarios');
  await expect(page.locator('nav').getByRole('link', { name: 'Detection' })).toBeVisible();
});
