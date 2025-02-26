import { getRoute } from '@app-builder/utils/routes';
import { expect, test } from 'tests/fixtures';
import { SignInPage } from 'tests/page-object-models/auth-pages';

const user = {
  email: 'admin@e2e.com',
  password: 'password',
};
// Since we do use the same user email for all tests, we need to run them serially.
test.describe.configure({ mode: 'serial' });

test.afterEach(async ({ firebase }) => {
  await firebase.deleteUser(user.email);
});

test('Users can sign in with Google', async ({ page, firebase }) => {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  const firebasePopup = firebase.popup(page);
  await signInPage.signInWithGoogle();
  await firebasePopup.signUpWithSSO(user.email);

  // Ensure signed in user is redirected to the scenarios page
  await page.waitForURL(getRoute('/scenarios/'));
  await page.getByRole('button').first().click();
  await expect(page.getByText(user.email)).toBeVisible();
});

test('Users can sign in with Microsoft', async ({ page, firebase }) => {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  const firebasePopup = firebase.popup(page);
  await signInPage.signInWithMicrosoft();
  await firebasePopup.signUpWithSSO(user.email);

  // Ensure signed in user is redirected to the scenarios page
  await page.waitForURL(getRoute('/scenarios/'));
  await page.getByRole('button').first().click();
  await expect(page.getByText(user.email)).toBeVisible();
});

test('Users can sign up with email and password', async ({ page, firebase }) => {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await page.getByRole('link', { name: 'Sign up' }).click();
  await page.waitForURL(getRoute('/sign-up'));

  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign up' }).click();

  await page.waitForURL(getRoute('/email-verification'));
  await firebase.verifyUser(user.email);
  await page.getByRole('link', { name: 'Sign in' }).click();
  await page.waitForURL(getRoute('/sign-in'));

  await signInPage.signInWithEmail(user);

  // Ensure signed in user is redirected to the scenarios page
  await page.waitForURL(getRoute('/scenarios/'));
  await page.getByRole('button').first().click();
  await expect(page.getByText(user.email)).toBeVisible();
});
