import type { Locator, Page } from '@playwright/test';

/**
 * Wait for the app to be fully hydrated.
 */
export const waitForHydration = async (page: Page, timeout = 10000) => {
  await page.locator('body[data-hydrated="true"]').waitFor({
    state: 'attached',
    timeout,
  });
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
