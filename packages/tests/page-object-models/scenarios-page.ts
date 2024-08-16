import { getRoute } from '@app-builder/utils/routes';
import { expect, type Page } from '@playwright/test';

import { boxedStep } from './utils';

export class ScenariosPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(getRoute('/scenarios/'));
    await this.page.waitForURL(getRoute('/scenarios/'));
  }

  @boxedStep
  async create({
    name,
    description,
    triggerObject,
  }: {
    name: string;
    description?: string;
    triggerObject: string;
  }) {
    await this.page.getByRole('button', { name: 'new scenario' }).click();
    await this.page.getByLabel('name').fill(name);
    if (description) {
      await this.page.getByLabel('description').fill(description);
    }
    await this.page.getByRole('combobox').click();
    await this.page.getByLabel(triggerObject).click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByText('Edit')).toBeVisible();
  }

  async open(name: string) {
    await this.page.getByRole('link', { name }).first().click();
  }
}
