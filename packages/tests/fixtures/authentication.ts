import { getRoute } from '@app-builder/utils/routes';
import { type Page, test as base } from '@playwright/test';
import { SignInPage } from 'tests/page-object-models/auth-pages';
import {
  FirebaseAuthEmulatorPage,
  FirebaseAuthEmulatorPopup,
} from 'tests/page-object-models/firebase-auth-emulator';

export const test = base.extend<{
  firebase: {
    verifyUser: (email: string) => Promise<void>;
    popup: (page: Page) => FirebaseAuthEmulatorPopup;
    createUser: (user: { email: string; password: string }) => Promise<void>;
    deleteUser: (email: string) => Promise<void>;
  };
  authenticate: {
    /**
     * Create a test user in Firebase and sign in with it.
     * The user will be deleted in Firebase after the test.
     * @param user a valid marble user (for now, test users must be seeded in the backend).
     */
    withTestUser: (user: { email: string; password: string }) => Promise<void>;
  };
}>({
  firebase: async ({ browser }, use) => {
    const firebaseAuthEmulator = new FirebaseAuthEmulatorPage(browser);

    await use({
      verifyUser: (email) => {
        return firebaseAuthEmulator.verifyUser(email);
      },
      popup: (page) => {
        const firebasePopup = new FirebaseAuthEmulatorPopup(page);
        return firebasePopup;
      },
      createUser: (user) => {
        return firebaseAuthEmulator.createUser(user);
      },
      deleteUser: async (email) => {
        await firebaseAuthEmulator.deleteUser(email);
      },
    });
  },
  authenticate: async ({ page }, use) => {
    await use({
      withTestUser: async (user) => {
        const signInPage = new SignInPage(page);
        await signInPage.goto();
        await signInPage.signInWithEmail(user);
        await page.waitForURL(getRoute('/scenarios/'));
      },
    });
  },
});

export const { expect } = test;
