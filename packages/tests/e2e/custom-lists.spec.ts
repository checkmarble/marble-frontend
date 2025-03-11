import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForThen } from 'tests/common/utils';

test('Create new list', async ({ page }) => {
  await page.goto('/lists');
  
  const listName = crypto.randomUUID();
  const values = Array.from({ length: 5 }, () => crypto.randomUUID());

  await page.getByRole('button', { name: 'New List' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(listName);
  await page.getByRole('textbox', { name: 'Description' }).fill('Lorem ipsum dolor sit amet');

  await waitForThen(
    page,
    page.getByRole('button', { name: 'Create new list' }),
    async (button) => await button.click(),
  );

  await page.waitForURL('/lists/**');
  await page.waitForLoadState();

  
  for (const value of values) {
    await waitForThen(page, page.getByRole('button', { name: 'New value' }), async (button) =>
      await button.click(),
    );

    await waitForThen(
      page,
      page.getByRole('textbox', { name: 'Value' }),
      async (field) => await field.fill(value),
    );

    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('textbox', { name: 'Value' }).waitFor({ state: 'hidden' });
  }

  await page.getByRole('listitem').filter({ hasText: 'Lists' }).getByRole('link').click();
  await page.waitForURL('/lists');
  await page.waitForLoadState();

  await page.getByRole('cell', { name: listName }).click();
  await page.waitForURL('/lists/**');
  await page.waitForLoadState();

  for (const value of values) {
    await expect(page.locator('table')).toContainText(value);
  }
});
