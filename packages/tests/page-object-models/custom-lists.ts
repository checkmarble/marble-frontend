import { getRoute } from '@app-builder/utils/routes';
import { expect, type Page } from '@playwright/test';

import { boxedStep } from './utils';

export class CustomListsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(getRoute('/lists/'));
    await this.page.waitForURL(getRoute('/lists/'));
  }

  @boxedStep
  async create({ name, description }: { name: string; description?: string }) {
    await this.page.getByRole('button', { name: 'new list' }).click();
    await this.page.getByLabel('name').fill(name);
    if (description) {
      await this.page.getByLabel('description').fill(description);
    }
    await this.page.getByRole('button', { name: 'Create' }).click();
    await expect(
      this.page.getByText('This list is empty. Add its first value to see it here.'),
    ).toBeVisible();
  }

  @boxedStep
  async open(name: string) {
    await this.page.getByRole('cell', { name }).first().click();
  }
}

export class CustomListDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @boxedStep
  async goBack() {
    await this.page.getByRole('button', { name: 'Go back' }).click();
  }

  @boxedStep
  async update({ name, description }: { name?: string; description?: string }) {
    await this.page.getByRole('button', { name: 'edit' }).click();
    if (name) await this.page.getByLabel('name').fill(name);
    if (description) await this.page.getByLabel('description').fill(description);
    await this.page.getByRole('button', { name: 'Save' }).click();
    if (name) await expect(this.page.getByText(name)).toBeVisible();
    if (description) await expect(this.page.getByText(description)).toBeVisible();
  }

  @boxedStep
  async createNewValue(value: string) {
    await this.page.getByRole('button', { name: 'new value' }).click();
    await this.page.getByLabel('Value', { exact: true }).fill(value);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByRole('cell', { name: value })).toBeVisible();
  }

  @boxedStep
  async deleteValue(value: string) {
    await this.page
      .getByRole('cell', { name: value })
      .getByRole('button', { name: 'delete' })
      .click();
    await this.page.getByRole('button', { name: 'delete' }).click();
    await expect(this.page.getByRole('cell', { name: value })).not.toBeVisible();
  }

  @boxedStep
  async delete() {
    await this.page.getByRole('button', { name: 'delete this list' }).click();
    await this.page.getByRole('button', { name: 'delete' }).click();
  }
}
