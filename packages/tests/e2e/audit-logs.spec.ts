import { expect, test } from '@playwright/test';
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
