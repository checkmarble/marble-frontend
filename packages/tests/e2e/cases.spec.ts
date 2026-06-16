import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

// Creates an inbox via settings UI and returns the inbox ID (SUUID from URL).
async function setupInbox(page: import('@playwright/test').Page): Promise<{ inboxId: string; inboxName: string }> {
  const inboxName = crypto.randomUUID();
  await page.goto('/settings/inboxes');
  await waitForHydration(page);
  await waitForThen(page, page.getByRole('button', { name: 'Create new inbox' }), async (btn) => await btn.click());
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await dialog.getByRole('textbox').and(dialog.locator('[name="name"]')).fill(inboxName);
  await dialog.getByRole('button', { name: 'Create new inbox' }).click();
  await page.waitForURL(/\/settings\/inboxes\/[^/]+$/);
  const inboxId = page.url().split('/').at(-1) as string;
  return { inboxId, inboxName };
}

// Creates a case in the given inbox. After submission the app redirects directly
// to the case detail page (`/cases/s/:caseId`), so this helper waits for that URL.
// Returns the case name.
async function createCase(page: import('@playwright/test').Page, inboxName: string): Promise<string> {
  const caseName = crypto.randomUUID();
  await page.locator('[data-test="create-case-trigger"]').click();

  // Scope all form interactions to the right panel (Radix Dialog) — the inbox
  // page also has a top-level inbox filter combobox we'd otherwise collide with.
  const panel = page.getByRole('dialog');
  await panel.waitFor();
  await panel.getByPlaceholder('Enter a name').fill(caseName);
  await panel.getByRole('combobox').click();
  await page.getByRole('option', { name: inboxName }).first().click();
  await panel.getByRole('button', { name: 'Create a new case' }).click();

  // Create-case redirects to /cases/s/:caseId (scenario case detail)
  await page.waitForURL(/\/cases\/s\//);
  await waitForHydration(page);
  return caseName;
}

test('Cases list page loads', async ({ page }) => {
  const { inboxId } = await setupInbox(page);
  await page.goto(`/cases/inboxes/${inboxId}`);
  await waitForHydration(page);

  await expect(page).toHaveURL(new RegExp(`/cases/inboxes/${inboxId}`));
  // The toolbar chrome must render (search input + the icon-only create-case button)
  await expect(page.getByPlaceholder('Search by name')).toBeVisible();
  await expect(page.locator('[data-test="create-case-trigger"]')).toBeVisible();
});

test('Create a case', async ({ page }) => {
  const { inboxId, inboxName } = await setupInbox(page);
  await page.goto(`/cases/inboxes/${inboxId}`);
  await waitForHydration(page);

  const caseName = await createCase(page, inboxName);

  // Post-create we're on the case detail; the case name appears in the page chrome
  await expect(page.locator('body')).toContainText(caseName);
});

test('View case detail', async ({ page }) => {
  const { inboxId, inboxName } = await setupInbox(page);
  await page.goto(`/cases/inboxes/${inboxId}`);
  await waitForHydration(page);

  await createCase(page, inboxName);

  // Case detail chrome: comment input + status/info sections
  await expect(page.getByPlaceholder('Write a note')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close case' })).toBeVisible();
});

test('Add a comment to a case', async ({ page }) => {
  const { inboxId, inboxName } = await setupInbox(page);
  await page.goto(`/cases/inboxes/${inboxId}`);
  await waitForHydration(page);

  await createCase(page, inboxName);

  const commentText = crypto.randomUUID();
  await page.getByPlaceholder('Write a note').fill(commentText);
  await page.getByRole('button', { name: 'post a comment' }).click();
  await waitForHydration(page);

  // The comment event should appear in the case events list
  await expect(page.locator('body')).toContainText(commentText);
});

test('Case is auto-assigned to creator', async ({ page }) => {
  const { inboxId, inboxName } = await setupInbox(page);
  await page.goto(`/cases/inboxes/${inboxId}`);
  await waitForHydration(page);

  await createCase(page, inboxName);

  // Creating a case auto-assigns it to the creator, so the assignee chip with
  // "(you)" suffix should be present and the "Assign to myself" CTA absent.
  await expect(page.locator('body')).toContainText('(you)');
  await expect(page.getByRole('button', { name: 'Assign to myself' })).toHaveCount(0);
});

test('Close a case', async ({ page }) => {
  const { inboxId, inboxName } = await setupInbox(page);
  await page.goto(`/cases/inboxes/${inboxId}`);
  await waitForHydration(page);

  await createCase(page, inboxName);

  await waitForThen(page, page.getByRole('button', { name: 'Close case' }), async (btn) => await btn.click());

  const modal = page.getByRole('dialog');
  await modal.waitFor();

  // Pick "Confirmed risk" outcome from the radio group
  await modal.getByText('Confirmed risk').click();
  await modal.getByRole('button', { name: 'Validate' }).click();
  await waitForHydration(page);

  // After closing, the action button swaps to "Reopen case" — a more reliable
  // signal than the status text (which renders as the outcome name, not "Resolved").
  await expect(page.getByRole('button', { name: 'Reopen case' })).toBeVisible();
});
