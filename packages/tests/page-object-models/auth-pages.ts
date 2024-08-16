import { getRoute } from '@app-builder/utils/routes';
import { expect, type Page } from '@playwright/test';

import { boxedStep } from './utils';

export class SignInPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(getRoute('/sign-in'));
  }

  @boxedStep
  async signInWithGoogle() {
    await this.page
      .getByRole('button', { name: 'Sign in with Google' })
      .click();
  }

  @boxedStep
  async signInWithMicrosoft() {
    await this.page
      .getByRole('button', { name: 'Sign in with Microsoft' })
      .click();
  }

  @boxedStep
  async signInWithEmail(user: { email: string; password: string }) {
    const email = this.page.getByLabel('Email');
    const password = this.page.getByLabel('Password');
    await expect(email).toBeEnabled();
    await email.fill(user.email);
    await expect(password).toBeEnabled();
    await password.fill(user.password);
    await this.page
      .getByRole('button', { name: 'Sign in', exact: true })
      .click();
  }
}
