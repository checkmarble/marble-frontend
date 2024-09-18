import { expect, type Page } from '@playwright/test';

import { FormulaBuilderPage } from './formula-builder';
import { boxedStep } from './utils';

export class ScenarioIterationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  @boxedStep
  async goto(tab: 'trigger' | 'rules' | 'decision') {
    const tabLink = this.page.getByRole('link', {
      name: {
        trigger: 'Trigger',
        rules: 'Rules',
        decision: 'Decision',
      }[tab],
      exact: true,
    });
    if ((await tabLink.getAttribute('aria-current')) === 'page') return;
    await tabLink.click();
    await expect(tabLink).toHaveAttribute('aria-current', 'page');
  }

  @boxedStep
  async editNameAndDescription(
    currentName: string,
    { newName, newDescription }: { newName?: string; newDescription?: string },
  ) {
    const scenarioNameButton = this.page.getByRole('button', {
      name: currentName,
    });
    await scenarioNameButton.click();
    const modal = this.page.getByLabel('Update Scenario');
    if (newName) {
      await modal.getByLabel('name').fill(newName);
    }
    if (newDescription) {
      await modal.getByLabel('description').fill(newDescription);
    }
    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Update Scenario' }),
    ).not.toBeVisible();
    if (newName) {
      await expect(scenarioNameButton).not.toBeVisible();
      await expect(
        this.page.getByRole('button', {
          name: newName,
        }),
      ).toBeVisible();
    }
  }

  get triggerConditionBuilder() {
    return new FormulaBuilderPage(this.page);
  }

  @boxedStep
  async saveTriggerCondition() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  @boxedStep
  async addNewRule() {
    await this.page.getByRole('button', { name: 'New Rule' }).click();
    await this.page.waitForURL(/\/rules\//);
  }

  @boxedStep
  async openFirstMatchingRule(name: string) {
    await this.page.getByText(name).first().click();
  }

  @boxedStep
  async editRuleInformations({
    name,
    description,
    ruleGroup,
    scoreModifier,
  }: {
    name?: string;
    description?: string;
    ruleGroup?: string;
    scoreModifier?: number;
  }) {
    if (name) {
      await this.page.getByLabel('Name').fill(name);
    }
    if (description) {
      await this.page.getByLabel('Description').fill(description);
    }
    if (ruleGroup) {
      await this.page.getByLabel('Rule Group').fill(ruleGroup);
    }
    if (scoreModifier !== undefined) {
      await this.page
        .getByLabel('Score Modifier')
        .fill(scoreModifier.toString());
    }
  }

  get ruleFormulaBuilder() {
    return new FormulaBuilderPage(this.page);
  }

  @boxedStep
  async saveRule() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  @boxedStep
  async setScoreReviewThreshold(threshold: number) {
    await this.page
      .getByLabel('Score review threshold')
      .fill(threshold.toString());
  }

  @boxedStep
  async setScoreDeclineThreshold(threshold: number) {
    await this.page
      .getByLabel('Score decline threshold')
      .fill(threshold.toString());
  }

  @boxedStep
  async saveDecisionOutcome() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  @boxedStep
  async commitVersion() {
    await this.page.getByRole('button', { name: 'Commit' }).click();
    await this.page.getByText('Committed version cannot be').click();
    await this.page.getByText('Activating the committed').click();
    await this.page.getByText('This action is immediate.').click();
    await this.page.getByRole('button', { name: 'Commit' }).click();
    await expect(
      this.page.getByRole('button', { name: 'Activate' }),
    ).toBeVisible();
  }

  @boxedStep
  async activateVersion() {
    await this.page.getByRole('button', { name: 'Activate' }).click();
    await this.page.getByText('This version will be live').click();
    await this.page.getByText('This action is immediate').click();
    await this.page.getByRole('button', { name: 'Activate' }).click();
    await expect(
      this.page.getByRole('button', { name: 'Deactivate' }),
    ).toBeVisible();
  }

  @boxedStep
  async deactivateVersion() {
    await this.page.getByRole('button', { name: 'Deactivate' }).click();
    await this.page.getByText('The scenario will stop operating').click();
    await this.page.getByText('This action is immediate').click();
    await this.page.getByRole('button', { name: 'Deactivate' }).click();
    await expect(
      this.page.getByRole('button', { name: 'Activate' }),
    ).toBeVisible();
  }
}
