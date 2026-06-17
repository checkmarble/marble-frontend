import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

// FIXME: the testcontainers backend image does not configure Convoy (webhook delivery service),
// so listing webhooks returns 500 and the "New webhook" button is rendered disabled by
// api-keys.tsx:270-273. Re-enable once the test backend ships v1.0.0 internal webhooks or
// gets CONVOY_* env vars wired through setup.ts.
test.fixme('Create a webhook', async ({ page }) => {
  await page.goto('/settings/api-keys');
  await waitForHydration(page);

  const webhookUrl = `https://example.com/${crypto.randomUUID()}`;

  await waitForThen(page, page.getByRole('button', { name: 'New webhook' }), async (button) => await button.click());

  const dialog = page.getByRole('dialog');
  await dialog.waitFor();

  await dialog.getByRole('textbox').and(dialog.locator('[name="url"]')).fill(webhookUrl);

  // Event types are required (zod enum array). Open the select, pick one event, close it.
  await dialog.getByRole('button', { name: 'All events by default' }).click();
  await page.getByRole('option', { name: 'decision.created' }).click();
  await page.keyboard.press('Escape');

  await dialog.getByRole('button', { name: 'Create new webhook' }).click();

  // The server function redirects to the new webhook's detail page.
  await page.waitForURL(/\/settings\/webhooks\/[^/]+$/);
  await waitForHydration(page);
  await expect(page.locator('body')).toContainText(webhookUrl);
});
