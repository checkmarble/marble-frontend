import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForThen } from 'tests/common/utils';

test('Create a user', async ({ page }) => {
  await page.goto('/settings');
  await page.waitForURL('/settings/users');

  await waitForThen(
    page,
    page.getByRole('button', { name: 'New user' }),
    async (button) => await button.click(),
  );

  const fn = crypto.randomUUID();
  const ln = crypto.randomUUID();
  const email = `${crypto.randomUUID()}@example.com`;

  await page.getByRole('textbox').and(page.locator('[name="firstName"]')).fill(fn);
  await page.getByRole('textbox').and(page.locator('[name="lastName"]')).fill(ln);
  await page.getByRole('textbox').and(page.locator('[name="email"]')).fill(email);
  await page.getByRole('button', { name: 'Create new user' }).click();

  await expect(page.locator('table')).toContainText(`${fn} ${ln}`);
  await expect(page.locator('table')).toContainText(email);
});
