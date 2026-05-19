import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

test('Create and revoke an API key', async ({ page }) => {
  await page.goto('/settings/api-keys');
  await waitForHydration(page);

  const description = crypto.randomUUID();

  await waitForThen(page, page.getByRole('button', { name: 'New API Key' }), async (button) => await button.click());

  const dialog = page.getByRole('dialog');
  await dialog.waitFor();

  await dialog.getByRole('textbox').and(dialog.locator('[name="description"]')).fill(description);
  // The role select defaults to API_CLIENT — the only option in the seeded env.
  await dialog.getByRole('button', { name: 'Create new API Key' }).click();

  await dialog.waitFor({ state: 'hidden' });

  const row = page.locator('tr', { hasText: description });
  await expect(row).toBeVisible();

  // Revoke: the row exposes a delete icon button with aria-label "Delete API Key".
  await row.getByRole('button', { name: 'Delete API Key' }).click();

  const confirmDialog = page.getByRole('dialog');
  await confirmDialog.waitFor();
  await confirmDialog.getByRole('button', { name: 'Delete', exact: true }).click();

  await confirmDialog.waitFor({ state: 'hidden' });
  await expect(page.locator('tr', { hasText: description })).toHaveCount(0);
});
