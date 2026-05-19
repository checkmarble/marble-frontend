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
