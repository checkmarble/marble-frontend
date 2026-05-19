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

  const table = page.getByRole('table');
  await expect(table.getByRole('columnheader', { name: 'Timestamp' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Actor' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Operation' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Table' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Internal entity ID' })).toBeVisible();
});
