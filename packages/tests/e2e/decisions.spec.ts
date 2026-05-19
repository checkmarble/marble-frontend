import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration } from 'tests/common/utils';

// The "Filters" trigger uses `first-letter:capitalize` over the lowercase i18n
// value `filters:filters` ("filters"). Visible text is lowercase; we match it
// via `hasText` on a scoped button locator (more reliable than getByRole name
// matching, which whitespace-normalizes svg+span content unpredictably).
const filtersTrigger = (page: import('@playwright/test').Page) => page.locator('button', { hasText: /^filters$/i });

test('Decisions page loads with chrome', async ({ page }) => {
  await page.goto('/detection/decisions');
  await waitForHydration(page);

  // `decisions` layout redirects analysts to `/cases`. The seeded `jbe@zorg.com`
  // is org admin (non-analyst), so we must stay on the page — pin the URL to
  // catch a future regression that flips the role check.
  await expect(page).toHaveURL(/\/detection\/decisions(?:[?/]|$)/);

  await expect(filtersTrigger(page)).toBeVisible();
  // The Input has type="search" + placeholder "Search by id" — anchor the
  // smoke on the placeholder, not the searchbox role (whose accessible name
  // computation has been flaky in this codebase's snapshot tree).
  await expect(page.getByPlaceholder('Search by id')).toBeVisible();
});

test('Search-by-id button is gated on a non-empty value', async ({ page }) => {
  await page.goto('/detection/decisions');
  await waitForHydration(page);

  // The submit button sits next to a `searchbox` with aria-label "Search by
  // id". Filter by exact visible text "Search" to disambiguate.
  const searchButton = page.locator('button', { hasText: /^Search$/ });
  await expect(searchButton).toBeDisabled();

  await page.getByPlaceholder('Search by id').fill(crypto.randomUUID());
  await expect(searchButton).toBeEnabled();
});

test('Filters menu lists all 9 options on first open', async ({ page }) => {
  await page.goto('/detection/decisions');
  await waitForHydration(page);

  await filtersTrigger(page).click();

  // Labels come from `getFilterTKey` (filters.ts) → en/decisions.json values.
  // Each item is a Radix DropdownMenu.Item (role="menuitem"), but we filter by
  // visible text to stay robust to icon children that the role-name algo
  // sometimes folds in.
  const expectedLabels = [
    'Date',
    'Scenario',
    'Trigger object',
    'Object ID',
    'Outcome',
    'Inbox',
    'Presence of a case',
    'Pivot value',
    'Scheduled execution',
  ];

  for (const label of expectedLabels) {
    await expect(page.locator('[role=menuitem]', { hasText: new RegExp(`^${label}$`) })).toBeVisible();
  }
});

test('Applying triggerObjectId encodes URL param and renders a chip', async ({ page }) => {
  await page.goto('/detection/decisions');
  await waitForHydration(page);

  await filtersTrigger(page).click();
  await page.locator('[role=menuitem]', { hasText: /^Object ID$/ }).click();

  // `TriggerObjectIdFilter` renders an Input with the placeholder from
  // `decisions:filters.trigger_object_id.placeholder`. Pressing Enter calls
  // `closeMenu` → `onDecisionFilterClose` → `submitDecisionFilters` because
  // the form is now dirty.
  const triggerObjectId = crypto.randomUUID();
  await page.getByPlaceholder('Enter the object id').fill(triggerObjectId);
  await page.keyboard.press('Enter');

  // Flat search param (not base64) — `validateSearch: decisionsListQueryParamsSchema`
  // serializes top-level keys directly into the query string.
  await expect(page).toHaveURL(new RegExp(`[?&]triggerObjectId=${triggerObjectId}(?:&|$)`));

  // `DecisionFiltersBar` composes the chip as `"Object ID: <uuid>"` (filter
  // tKey + displayValue), rendered inside `FilterItem.Trigger` (a button).
  await expect(page.locator('button', { hasText: `Object ID: ${triggerObjectId}` })).toBeVisible();
});

test('Clearing a chip via the X removes the URL param', async ({ page }) => {
  // Preset URL state instead of chaining off the previous test — keeps tests
  // independent and exercises the loader's search-param hydration path.
  const triggerObjectId = crypto.randomUUID();
  await page.goto(`/detection/decisions?triggerObjectId=${triggerObjectId}`);
  await waitForHydration(page);

  const chipTrigger = page.locator('button', { hasText: `Object ID: ${triggerObjectId}` });
  await expect(chipTrigger).toBeVisible();

  // `FilterItem.Clear` is an unlabeled `<button>` containing only a cross
  // icon — it has no accessible name, so target it via its sibling
  // relationship to the trigger inside `FilterItem.Root`.
  await chipTrigger.locator('xpath=following-sibling::button[1]').click();

  await expect(page).not.toHaveURL(/triggerObjectId=/);

  // `DecisionFiltersBar` short-circuits to `null` when no filters are defined,
  // so the chip's button disappears entirely.
  await expect(chipTrigger).toHaveCount(0);
});
