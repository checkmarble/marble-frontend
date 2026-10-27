import { expect, type Page, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

// The inbox panel is an unnamed dialog; the inbox name field identifies it.
const inboxPanel = (page: Page) => page.getByRole('dialog').filter({ has: page.locator('[name="name"]') });

// Creates an inbox from the settings page. Creating keeps the panel open in edit
// mode and puts the inbox in the `inboxId` search param.
async function createInbox(page: Page) {
  const inboxName = crypto.randomUUID();

  await page.goto('/settings/inboxes');
  await waitForHydration(page);
  await waitForThen(
    page,
    page.getByRole('button', { name: 'Create new inbox' }),
    async (button) => await button.click(),
  );

  // The trigger and the submit share the same accessible name; scope to the panel.
  const panel = inboxPanel(page);
  await panel.waitFor();
  await panel.locator('[name="name"]').fill(inboxName);
  await panel.getByRole('button', { name: 'Create new inbox' }).click();

  await page.waitForURL(/\/settings\/inboxes\?inboxId=[^&]+$/);
  await expect(panel.getByText('Inbox information')).toBeVisible();

  return inboxName;
}

test('Create an inbox', async ({ page }) => {
  const inboxName = await createInbox(page);

  await expect(inboxPanel(page).locator('[name="name"]')).toHaveValue(inboxName);
  await expect(page.locator('table').first()).toContainText(inboxName);
});

test('Rename an inbox', async ({ page }) => {
  await createInbox(page);
  const updatedName = crypto.randomUUID();

  const panel = inboxPanel(page);
  await panel.locator('[name="name"]').fill(updatedName);
  await panel.getByRole('button', { name: 'Save', exact: true }).click();
  // Saving closes the panel and clears the search param.
  await panel.waitFor({ state: 'hidden' });
  await page.waitForURL(/\/settings\/inboxes$/);

  await expect(page.locator('table').first()).toContainText(updatedName);
});

test('Delete an inbox', async ({ page }) => {
  const inboxName = await createInbox(page);

  await inboxPanel(page).getByRole('button', { name: 'Delete inbox' }).click();
  const deleteDialog = page.getByRole('dialog', { name: 'Delete inbox' });
  await deleteDialog.waitFor();
  await deleteDialog.getByRole('button', { name: 'Delete', exact: true }).click();
  // Deleting closes the panel and clears the search param.
  await page.waitForURL(/\/settings\/inboxes$/);
  await waitForHydration(page);
  await expect(page.locator('table').first()).not.toContainText(inboxName);
});
