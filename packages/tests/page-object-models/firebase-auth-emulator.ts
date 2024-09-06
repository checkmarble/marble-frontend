import { type Browser, expect, type Page } from '@playwright/test';

import { boxedStep } from './utils';

/**
 * Page object model for the Firebase Auth emulator page.
 *
 * Internally, this opens and closes a new page to interact with the Firebase Auth emulator.
 */
export class FirebaseAuthEmulatorPage {
  readonly browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  private async newPage(cb: (page: Page) => Promise<void>) {
    const page = await this.browser.newPage();
    await page.goto('http://localhost:4000/auth');
    await cb(page);
    await page.close();
  }

  @boxedStep
  async createUser(user: { email: string; password: string }) {
    await this.newPage(async (page) => {
      await page.getByRole('button', { name: 'Add user' }).click();
      await page.getByPlaceholder('Enter email (optional)').fill(user.email);
      await page.getByLabel('Verified email?').check();
      await page.getByPlaceholder('Enter password').fill(user.password);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText(user.email)).toBeVisible();
    });
  }

  @boxedStep
  async verifyUser(email: string) {
    await this.newPage(async (page) => {
      await page.getByLabel(`Open menu for user ${email}`).click();
      await page.getByRole('menuitem', { name: 'Edit user' }).click();
      const verifiedEmail = page.getByLabel('Verified email?');
      await expect(verifiedEmail).toBeVisible();
      await verifiedEmail.check();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(verifiedEmail).not.toBeVisible();
    });
  }

  @boxedStep
  async deleteUser(email: string) {
    await this.newPage(async (page) => {
      await page.getByLabel(`Open menu for user ${email}`).click();
      await page.getByRole('menuitem', { name: 'Delete user' }).click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(
        page.getByLabel(`Open menu for user ${email}`),
      ).not.toBeVisible();
    });
  }

  @boxedStep
  async deleteAllUsers() {
    await this.newPage(async (page) => {
      const noUsers = page.getByText('No users for this project yet');
      if (await noUsers.isVisible()) return;
      await page.getByRole('button', { name: 'Clear all data' }).click();
      await expect(noUsers).toBeVisible();
    });
  }
}

/**
 * Page object model for the Firebase Auth emulator popup.
 *
 * ```ts
 * // create an instance of this class before triggering the popup:
 * const firebasePopup = new FirebaseAuthEmulatorPopup(page);
 * await page.getByRole('button', { name: 'Sign in with Google' }).click();
 * await firebase.signInWith(userEmail);
 * ```
 */
export class FirebaseAuthEmulatorPopup {
  readonly firebasePopupPromise: Promise<Page>;

  constructor(page: Page) {
    this.firebasePopupPromise = page.waitForEvent('popup');
  }

  @boxedStep
  async signInWith(email: string) {
    const firebasePopup = await this.firebasePopupPromise;
    const userButton = firebasePopup.locator('li').filter({ hasText: email });
    await expect(userButton).toHaveCount(1);
    await userButton.click();
  }

  @boxedStep
  async signUpWithSSO(email: string) {
    const firebasePopup = await this.firebasePopupPromise;
    await firebasePopup
      .getByRole('button', { name: 'Add new account' })
      .click({ timeout: 1000 });
    await firebasePopup.locator('#email-input').fill(email);
    await firebasePopup
      .getByRole('button', { name: 'Sign in' })
      .click({ timeout: 1000 });
  }
}
