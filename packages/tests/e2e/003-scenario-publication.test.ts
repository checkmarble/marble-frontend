import { expect, test } from 'tests/fixtures';
import { ScenarioIterationPage } from 'tests/page-object-models/scenario-iteration-page';
import { ScenariosPage } from 'tests/page-object-models/scenarios-page';

const user = {
  email: 'admin@e2e.com',
  password: 'password',
};

test.beforeAll(async ({ firebase }) => {
  await firebase.createUser(user);
});

test.afterAll(async ({ firebase }) => {
  await firebase.deleteUser(user.email);
});

test('create and activate a valid scenario', async ({ page, authenticate }) => {
  await authenticate.withTestUser(user);

  const scenariosPage = new ScenariosPage(page);
  await scenariosPage.create({
    name: 'Test',
    triggerObject: 'transactions',
  });

  const scenarioIterationPage = new ScenarioIterationPage(page);

  await scenarioIterationPage.editNameAndDescription('Test', {
    newName: 'Validate SEPA Payouts',
    newDescription: 'SEPA payout validation',
  });

  await scenarioIterationPage.goto('trigger');

  await expect(
    page.getByText('At least one condition is required'),
  ).toBeVisible();

  const { triggerConditionBuilder } = scenarioIterationPage;

  await triggerConditionBuilder.addCondition();

  await triggerConditionBuilder.selectFirstEmptyOperand();
  await triggerConditionBuilder.getField('transactions.payment_method');

  await triggerConditionBuilder.selectOperator('=');

  await triggerConditionBuilder.selectFirstEmptyOperand();
  await triggerConditionBuilder.useStringConstant('TRANSFER');

  await triggerConditionBuilder.addCondition();

  await triggerConditionBuilder.selectFirstEmptyOperand();
  await triggerConditionBuilder.searchAndSelectFirstResult('direction');

  await triggerConditionBuilder.selectOperator('=');

  await triggerConditionBuilder.selectFirstEmptyOperand();
  await triggerConditionBuilder.useStringConstant('PAYOUT');

  await scenarioIterationPage.saveTriggerCondition();

  await scenarioIterationPage.goto('rules');
  await scenarioIterationPage.addNewRule();
  await scenarioIterationPage.editRuleInformations({
    name: 'check if customer is in blacklist',
    description: 'check if customer is in blacklist',
    scoreModifier: 30,
    ruleGroup: 'Checklist',
  });

  // TODO: improve this part, to create more rules and explore the rule builder
  const { ruleFormulaBuilder } = scenarioIterationPage;
  await ruleFormulaBuilder.addGroup();
  await ruleFormulaBuilder.selectFirstEmptyOperand();
  await triggerConditionBuilder.getField('transactions.payment_method');

  await triggerConditionBuilder.selectOperator('=');

  await triggerConditionBuilder.selectFirstEmptyOperand();
  await triggerConditionBuilder.useStringConstant('TRANSFER');

  await scenarioIterationPage.saveRule();

  await page.getByRole('button', { name: 'Go back' }).click();

  await scenarioIterationPage.goto('decision');

  await scenarioIterationPage.setScoreReviewThreshold(10);
  await scenarioIterationPage.setScoreRejectThreshold(40);
  await scenarioIterationPage.saveDecisionOutcome();

  await scenarioIterationPage.commitVersion();
  await scenarioIterationPage.activateVersion();
});
