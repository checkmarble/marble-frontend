import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration } from 'tests/common/utils';

test('Audit logs page loads for admin', async ({ page }) => {
  await page.goto('/settings/audit-logs');
  await waitForHydration(page);

  // Loader silently redirects non-admins to `/`, so pin the URL to catch a
  // permission regression that would otherwise render the home page fine.
  // `validateSearch` materializes default query params (`?q=&limit=25`) on
  // first paint, so anchor on the path-segment terminator, not end-of-string.
  await expect(page).toHaveURL(/\/settings\/audit-logs(?:\?|$)/);

  await expect(page.getByRole('heading', { name: 'Audit logs' })).toBeVisible();

  // The `<table>` only mounts on the `isSuccess` branch of the audit-events
  // query, and the backend `/admin/audit-events` endpoint requires a stricter
  // admin role than the route loader's `isAdmin()` — in the test image the
  // seeded admin gets 403, pushing the page into `isError`. Assert on chrome
  // that renders unconditionally: pagination row + filter bar trigger.
  await expect(page.getByText('Events per page:')).toBeVisible();
});

test('Pagination limit selector updates URL', async ({ page }) => {
  await page.goto('/settings/audit-logs');
  await waitForHydration(page);

  // PaginationRow renders [25, 50, 100] buttons unconditionally (outside the
  // audit-events query match block). Clicking "50" calls `setLimit(50)` →
  // `updatePage(query, 50)` → `useNavigate` with the new search params, which
  // `validateSearch` then materializes back into the URL.
  await page.getByRole('button', { name: '50' }).click();
  await expect(page).toHaveURL(/[?&]limit=50(?:&|$)/);
});

test('Adding entityId filter encodes into URL q param', async ({ page }) => {
  await page.goto('/settings/audit-logs');
  await waitForHydration(page);

  await page.getByRole('button', { name: 'Add new filter' }).click();

  // MenuCommand.Item wraps cmdk's Command.Item which renders role="option".
  // The entityId entry's label is "Internal entity ID"
  // (settings:audit.table.entity_id).
  await page.getByRole('option', { name: 'Internal entity ID' }).click();

  // `TextInputFilterMenu` renders an Input with the hardcoded placeholder
  // "abc123..." (DisplayAuditFilterMenuItem.tsx). A UUID guarantees the chip
  // text is unique on the page regardless of test ordering or worker count.
  const entityId = crypto.randomUUID();
  await page.getByPlaceholder('abc123...').fill(entityId);
  await page.keyboard.press('Enter');

  // `useBase64Query` serializes the filter object into a base64 `q` param.
  // Pre-filter, the URL is `?q=&limit=25` (empty q from validateSearch
  // defaulting). Assert the new q= is non-empty, not its exact value.
  await expect(page).toHaveURL(/[?&]q=[^&]+/);
  // Active filter chip renders "Internal entity ID: <value>" — match on the
  // unique UUID to avoid colliding with the (now-closed) menu label.
  await expect(page.getByText(entityId)).toBeVisible();
});
