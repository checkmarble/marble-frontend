import { type Page } from '@playwright/test';

import { boxedStep } from './utils';

export class FormulaBuilderPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @boxedStep
  async addGroup() {
    await this.page.getByRole('button', { name: 'Group' }).click();
  }

  @boxedStep
  async addCondition() {
    await this.page.getByRole('button', { name: 'Condition' }).click();
  }

  @boxedStep
  async selectFirstEmptyOperand() {
    await this.page
      .getByRole('button', { name: 'Select an operand...' })
      .first()
      .click();
  }

  @boxedStep
  async selectOperator(operator: string) {
    await this.page
      .locator('button')
      .filter({ hasText: /^\.\.\.$/ })
      .click();
    await this.page.getByLabel(operator).click();
  }

  @boxedStep
  async getField(field: string) {
    const parts = field.split('.');
    if (parts.length === 1) throw new Error('field must be a path');
    await this.page
      .getByLabel('Fields')
      .getByText(parts.slice(0, -1).join('.'), { exact: true })
      .click();
    await this.page
      .getByRole('menuitem', { name: parts[parts.length - 1] })
      .click();
  }

  @boxedStep
  async search(name: string) {
    await this.page.getByPlaceholder('Select or create an operand').fill(name);
  }

  @boxedStep
  async searchAndSelectFirstResult(name: string) {
    await this.search(name);
    await this.page.getByLabel('Result').getByText(name).first().click();
  }

  @boxedStep
  async useStringConstant(constant: string) {
    await this.search(constant);
    await this.page
      .getByRole('option', { name: `"${constant}" Use string` })
      .click();
  }
}
