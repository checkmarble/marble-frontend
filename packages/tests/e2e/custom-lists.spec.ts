import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

test('Create new list', async ({ page }) => {
  await page.goto('/detection/lists');
  await waitForHydration(page);

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

  await page.waitForURL('/detection/lists/**');
  await page.waitForLoadState();

  for (const value of values) {
    await waitForThen(page, page.getByRole('button', { name: 'New value' }), async (button) => await button.click());

    await waitForThen(page, page.getByRole('textbox', { name: 'Value' }), async (field) => await field.fill(value));

    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('textbox', { name: 'Value' }).waitFor({ state: 'hidden' });
  }

  await page.getByRole('link', { name: 'Lists' }).click();
  await page.waitForURL('/detection/lists');
  await page.waitForLoadState();

  await page.getByRole('cell', { name: listName }).click();
  await page.waitForURL('/detection/lists/**');
  await page.waitForLoadState();

  for (const value of values) {
    await expect(page.locator('table')).toContainText(value);
  }
});

test('Add a value to an existing list', async ({ page }) => {
  const listName = crypto.randomUUID();
  await page.goto('/detection/lists');
  await waitForHydration(page);

  // Create list
  await page.getByRole('button', { name: 'New List' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(listName);
  await page.getByRole('textbox', { name: 'Description' }).fill('desc');
  await waitForThen(page, page.getByRole('button', { name: 'Create new list' }), async (btn) => await btn.click());
  await page.waitForURL('/detection/lists/**');
  await page.waitForLoadState();

  // Add a new value
  const newValue = crypto.randomUUID();
  await waitForThen(page, page.getByRole('button', { name: 'New value' }), async (btn) => await btn.click());
  await waitForThen(page, page.getByRole('textbox', { name: 'Value' }), async (f) => await f.fill(newValue));
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('textbox', { name: 'Value' }).waitFor({ state: 'hidden' });

  await expect(page.locator('table')).toContainText(newValue);
});

test('Delete a list value', async ({ page }) => {
  const listName = crypto.randomUUID();
  await page.goto('/detection/lists');
  await waitForHydration(page);

  // Create list
  await page.getByRole('button', { name: 'New List' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(listName);
  await page.getByRole('textbox', { name: 'Description' }).fill('desc');
  await waitForThen(page, page.getByRole('button', { name: 'Create new list' }), async (btn) => await btn.click());
  await page.waitForURL('/detection/lists/**');
  await page.waitForLoadState();

  // Add a value
  const value = crypto.randomUUID();
  await waitForThen(page, page.getByRole('button', { name: 'New value' }), async (btn) => await btn.click());
  await waitForThen(page, page.getByRole('textbox', { name: 'Value' }), async (f) => await f.fill(value));
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('textbox', { name: 'Value' }).waitFor({ state: 'hidden' });
  await expect(page.locator('table')).toContainText(value);

  // Delete the value — each row has a hidden delete button revealed on hover,
  // tagged with `data-test="delete-list-value-trigger"`.
  const valueRow = page.locator('tr', { hasText: value });
  await valueRow.locator('[data-test="delete-list-value-trigger"]').click();
  const modal = page.getByRole('dialog');
  await modal.waitFor();
  await modal.getByRole('button', { name: 'Delete' }).click();
  await modal.waitFor({ state: 'hidden' });

  // When the last value is deleted, the table is replaced with an empty-state
  // component (`empty_custom_list_values_list`), so we cannot assert on `<table>`.
  await expect(page.locator('body')).not.toContainText(value);
});

test('Delete a list', async ({ page }) => {
  const listName = crypto.randomUUID();
  await page.goto('/detection/lists');
  await waitForHydration(page);

  // Create list
  await page.getByRole('button', { name: 'New List' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(listName);
  await page.getByRole('textbox', { name: 'Description' }).fill('desc');
  await waitForThen(page, page.getByRole('button', { name: 'Create new list' }), async (btn) => await btn.click());
  await page.waitForURL('/detection/lists/**');
  await page.waitForLoadState();

  // delete_list.button = "Delete this list"
  await page.getByRole('button', { name: 'Delete this list' }).click();
  const modal = page.getByRole('dialog');
  await modal.waitFor();
  await modal.getByRole('button', { name: 'Delete' }).click();

  await page.waitForURL('/detection/lists');
  await page.waitForLoadState();

  await expect(page.locator('body')).not.toContainText(listName);
});
