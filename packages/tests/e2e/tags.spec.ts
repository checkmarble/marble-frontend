import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

test('Create a case tag', async ({ page }) => {
  await page.goto('/settings/tags');
  await waitForHydration(page);

  const tagName = crypto.randomUUID();

  await waitForThen(page, page.getByRole('button', { name: 'New tag' }), async (button) => await button.click());

  const dialog = page.getByRole('dialog');
  await dialog.waitFor();

  await dialog.getByRole('textbox').and(dialog.locator('[name="name"]')).fill(tagName);
  // Color defaults to the first swatch, target defaults to "case" — both are valid.
  await dialog.getByRole('button', { name: 'Create new tag' }).click();

  await dialog.waitFor({ state: 'hidden' });
  await expect(page.locator('table').first()).toContainText(tagName);
});

test('Update a tag', async ({ page }) => {
  const tagName = crypto.randomUUID();
  const updatedName = crypto.randomUUID();

  // Create tag
  await page.goto('/settings/tags');
  await waitForHydration(page);
  await waitForThen(page, page.getByRole('button', { name: 'New tag' }), async (btn) => await btn.click());
  const createDialog = page.getByRole('dialog');
  await createDialog.waitFor();
  await createDialog.getByRole('textbox').and(createDialog.locator('[name="name"]')).fill(tagName);
  await createDialog.getByRole('button', { name: 'Create new tag' }).click();
  await createDialog.waitFor({ state: 'hidden' });
  await expect(page.locator('table').first()).toContainText(tagName);

  // Update the tag — the edit icon has aria-label "Update tag"
  const tagRow = page.locator('tr', { hasText: tagName });
  await tagRow.locator('[aria-label="Update tag"]').click();
  const updateDialog = page.getByRole('dialog');
  await updateDialog.waitFor();
  await updateDialog.locator('[name="name"]').clear();
  await updateDialog.locator('[name="name"]').fill(updatedName);
  await updateDialog.getByRole('button', { name: 'Save' }).click();
  await updateDialog.waitFor({ state: 'hidden' });

  await expect(page.locator('table').first()).toContainText(updatedName);
  await expect(page.locator('table').first()).not.toContainText(tagName);
});

test('Delete a tag', async ({ page }) => {
  const tagName = crypto.randomUUID();

  // Create tag
  await page.goto('/settings/tags');
  await waitForHydration(page);
  await waitForThen(page, page.getByRole('button', { name: 'New tag' }), async (btn) => await btn.click());
  const createDialog = page.getByRole('dialog');
  await createDialog.waitFor();
  await createDialog.getByRole('textbox').and(createDialog.locator('[name="name"]')).fill(tagName);
  await createDialog.getByRole('button', { name: 'Create new tag' }).click();
  await createDialog.waitFor({ state: 'hidden' });
  await expect(page.locator('table').first()).toContainText(tagName);

  // Delete the tag — the delete icon has aria-label "Delete tag"
  const tagRow = page.locator('tr', { hasText: tagName });
  await tagRow.locator('[aria-label="Delete tag"]').click();
  const deleteDialog = page.getByRole('dialog');
  await deleteDialog.waitFor();
  await deleteDialog.getByRole('button', { name: 'Delete' }).click();
  await deleteDialog.waitFor({ state: 'hidden' });

  await expect(page.locator('table').first()).not.toContainText(tagName);
});
