import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

test('Create an inbox', async ({ page }) => {
  await page.goto('/settings/inboxes');
  await waitForHydration(page);

  const inboxName = crypto.randomUUID();

  await waitForThen(
    page,
    page.getByRole('button', { name: 'Create new inbox' }),
    async (button) => await button.click(),
  );

  // The trigger and the submit share the same accessible name; scope to the dialog.
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();

  await dialog.getByRole('textbox').and(dialog.locator('[name="name"]')).fill(inboxName);
  await dialog.getByRole('button', { name: 'Create new inbox' }).click();

  await page.waitForURL(/\/settings\/inboxes\/[^/]+$/);
  await waitForHydration(page);
  await expect(page.locator('body')).toContainText(inboxName);

  await page.goto('/settings/inboxes');
  await waitForHydration(page);
  await expect(page.locator('table').first()).toContainText(inboxName);
});
