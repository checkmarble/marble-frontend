import type { Locator, Page } from '@playwright/test';

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
