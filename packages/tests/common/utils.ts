import type { Locator, Page } from '@playwright/test';

/**
 * Chromium starts every page with the virtual cursor at (0, 0), which sits inside
 * `LeftSidebar`'s collapsed 56px rail. On `:hover` the rail goes `absolute` and
 * expands to 234px, overlaying the top-left of the content area. The 400ms guard
 * delay that shields real users is cancelled by the `motion-reduce:delay-0`
 * variant, and the Playwright config runs with `reducedMotion: 'reduce'` — so the
 * overlay is instant here. Any click landing under it then fails actionability
 * with "…group/sidebar… subtree intercepts pointer events".
 *
 * Park the cursor against the right edge so the sidebar stays collapsed.
 */
export const parkMouse = async (page: Page) => {
  const viewport = page.viewportSize();
  if (!viewport) return;

  await page.mouse.move(viewport.width - 1, Math.floor(viewport.height / 2));
};

/**
 * Wait for the app to be fully hydrated.
 */
export const waitForHydration = async (page: Page, timeout = 10000) => {
  await page.locator('body[data-hydrated="true"]').waitFor({
    state: 'attached',
    timeout,
  });
  await parkMouse(page);
};

export const waitForThen = async (
  page: Page,
  locator: Locator,
  callback: (locator: Locator) => Promise<void>,
  state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible',
) => {
  await locator.waitFor({ state });
  await callback(locator);
  await page.waitForLoadState();
};
