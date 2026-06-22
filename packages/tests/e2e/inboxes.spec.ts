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

test('Rename an inbox', async ({ page }) => {
  const inboxName = crypto.randomUUID();
  const updatedName = crypto.randomUUID();

  // Create inbox
  await page.goto('/settings/inboxes');
  await waitForHydration(page);
  await waitForThen(
    page,
    page.getByRole('button', { name: 'Create new inbox' }),
    async (button) => await button.click(),
  );
  const createDialog = page.getByRole('dialog');
  await createDialog.waitFor();
  await createDialog.getByRole('textbox').and(createDialog.locator('[name="name"]')).fill(inboxName);
  await createDialog.getByRole('button', { name: 'Create new inbox' }).click();
  await page.waitForURL(/\/settings\/inboxes\/[^/]+$/);
  await waitForHydration(page);

  // Rename via the "Update inbox" modal
  await waitForThen(page, page.getByRole('button', { name: 'Update inbox' }), async (btn) => await btn.click());
  const updateDialog = page.getByRole('dialog');
  await updateDialog.waitFor();
  // Clear and refill the name field
  await updateDialog.locator('[name="name"]').clear();
  await updateDialog.locator('[name="name"]').fill(updatedName);
  await updateDialog.getByRole('button', { name: 'Save' }).click();
  await updateDialog.waitFor({ state: 'hidden' });
  await waitForHydration(page);

  await expect(page.locator('body')).toContainText(updatedName);
});

test('Delete an inbox', async ({ page }) => {
  const inboxName = crypto.randomUUID();

  // Create inbox
  await page.goto('/settings/inboxes');
  await waitForHydration(page);
  await waitForThen(
    page,
    page.getByRole('button', { name: 'Create new inbox' }),
    async (button) => await button.click(),
  );
  const createDialog = page.getByRole('dialog');
  await createDialog.waitFor();
  await createDialog.getByRole('textbox').and(createDialog.locator('[name="name"]')).fill(inboxName);
  await createDialog.getByRole('button', { name: 'Create new inbox' }).click();
  await page.waitForURL(/\/settings\/inboxes\/[^/]+$/);
  await waitForHydration(page);

  // Delete inbox
  await page.getByRole('button', { name: 'Delete inbox' }).click();
  const deleteDialog = page.getByRole('dialog');
  await deleteDialog.waitFor();
  await deleteDialog.getByRole('button', { name: 'Delete' }).click();
  // Deleting redirects back to the list once the server-side delete commits.
  // Wait for that redirect instead of racing it with a manual goto.
  await page.waitForURL(/\/settings\/inboxes$/);
  await waitForHydration(page);
  await expect(page.locator('body')).not.toContainText(inboxName);
});
