import { expect, test } from '@playwright/test';
import crypto from 'crypto';
import { waitForHydration, waitForThen } from 'tests/common/utils';

// Creates a scenario and navigates to the rules edit page, ready to add rules.
// Returns the scenario name and the current URL (rules list).
async function createScenarioAndGoToRules(page: import('@playwright/test').Page): Promise<string> {
  const scenarioName = crypto.randomUUID();
  await page.goto('/detection/scenarios');
  await waitForHydration(page);

  await page.getByRole('button', { name: 'New Scenario' }).click();
  await waitForThen(page, page.getByRole('textbox', { name: 'Name' }), async (f) => await f.fill(scenarioName));
  await page.getByRole('textbox', { name: 'Description' }).fill('DESC');
  await waitForThen(page, page.getByRole('combobox'), async (box) => await box.click());
  await waitForThen(page, page.getByRole('option', { name: 'transactions' }), async (option) => await option.click());
  await page.getByRole('button', { name: 'Save' }).click();
  await waitForHydration(page);

  // Set a trigger condition (required before rules can be added)
  await waitForThen(
    page,
    page.getByRole('button', { name: 'Add trigger condition' }),
    async (btn) => await btn.click(),
  );
  await page.getByRole('button', { name: 'Condition', exact: true }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).first().click();
  await page.getByRole('option', { name: 'transactions' }).hover();
  await page.getByText('amount').click();
  await page.getByRole('button', { name: '...' }).first().click();
  await page.getByRole('option', { name: '>' }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).click();
  await page.getByPlaceholder('Select or create an operand').fill('100');
  await page.getByPlaceholder('Select or create an operand').press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('link', { name: 'Rules' }).click();
  await waitForHydration(page);

  return scenarioName;
}

// Adds a rule to the current rules edit page and saves it, ending on the rule detail page.
async function addRule(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Add a Rule' }).click();
  await page.getByRole('button', { name: 'Group', exact: true }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).first().click();
  await page.getByRole('option', { name: 'transactions' }).hover();
  await page.getByText('amount').click();
  await page.getByRole('button', { name: '...' }).first().click();
  await page.getByRole('option', { name: '>' }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).click();
  await page.getByPlaceholder('Select or create an operand').fill('9000');
  await page.getByPlaceholder('Select or create an operand').press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();
  await waitForHydration(page);
}

test('Create a simple scenario', async ({ page }) => {
  await page.goto('/detection/scenarios');
  await waitForHydration(page);

  const scenarioName = crypto.randomUUID();

  await page.getByRole('button', { name: 'New Scenario' }).click();

  await waitForThen(page, page.getByRole('textbox', { name: 'Name' }), async (field) => await field.fill(scenarioName));

  await page.getByRole('textbox', { name: 'Description' }).fill('DESC');

  await waitForThen(page, page.getByRole('combobox'), async (box) => await box.click());

  await waitForThen(page, page.getByRole('option', { name: 'transactions' }), async (option) => await option.click());

  await page.getByRole('button', { name: 'Save' }).click();
  await waitForHydration(page);

  await waitForThen(
    page,
    page.getByRole('button', { name: 'Add trigger condition' }),
    async (button) => await button.click(),
  );

  await page.getByRole('button', { name: 'Condition', exact: true }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).first().click();
  await page.getByRole('option', { name: 'transactions' }).hover();
  await page.getByText('amount').click();
  await page.getByRole('button', { name: '...' }).first().click();
  await page.getByRole('option', { name: '>' }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).click();
  await page.getByPlaceholder('Select or create an operand').fill('100');
  await page.getByPlaceholder('Select or create an operand').press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Rules' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Add a Rule' }).click();
  await page.getByRole('button', { name: 'Group', exact: true }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).first().click();
  await page.getByRole('option', { name: 'transactions' }).hover();
  await page.getByText('amount').click();
  await page.getByRole('button', { name: '...' }).first().click();
  await page.getByRole('option', { name: '>' }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).click();
  await page.getByPlaceholder('Select or create an operand').fill('9000');
  await page.getByPlaceholder('Select or create an operand').press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('link', { name: 'Detection' }).first().click();

  await expect(page.getByRole('cell', { name: scenarioName })).toBeVisible();

  await page.getByRole('cell', { name: scenarioName }).click();
  await page.getByRole('link', { name: 'Edit scenario' }).click();

  await expect(page.getByRole('button', { name: 'edit_operand.operator_type.' })).toHaveText('amount');
  await expect(page.getByRole('button', { name: '>' })).toHaveText('>');
  await expect(page.getByRole('button', { name: 'Number 100' })).toBeVisible();
});

test('Delete a rule', async ({ page }) => {
  await createScenarioAndGoToRules(page);
  await addRule(page);

  // On the rule detail page, click "Delete" and confirm in the modal
  await page.getByRole('button', { name: 'Delete' }).click();
  const modal = page.getByRole('dialog');
  await modal.waitFor();
  await modal.getByRole('button', { name: 'Delete' }).click();
  await waitForHydration(page);

  // Deletion redirects back to the rules list — expect an empty rules table
  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
});

test('Duplicate a rule', async ({ page }) => {
  await createScenarioAndGoToRules(page);
  await addRule(page);

  // On the rule detail page, click "Clone" and confirm
  await page.getByRole('button', { name: 'Clone' }).click();
  const modal = page.getByRole('dialog');
  await modal.waitFor();
  await modal.getByRole('button', { name: 'Create a copy' }).click();
  await waitForHydration(page);

  // Navigate back to the rules list — both the original and the copy should appear
  await page.getByRole('link', { name: 'Rules' }).click();
  await waitForHydration(page);
  await expect(page.locator('table tbody tr')).toHaveCount(2);
});

test('Copy a scenario', async ({ page }) => {
  const scenarioName = await createScenarioAndGoToRules(page);

  // Navigate back to the scenarios list
  await page.getByRole('link', { name: 'Detection' }).first().click();
  await waitForHydration(page);

  // The copy button on the scenario row has title="Duplicate" (copy_scenario.title)
  const scenarioRow = page.locator('tr', { hasText: scenarioName });
  await scenarioRow.getByRole('button', { name: 'Duplicate' }).click();

  const modal = page.getByRole('dialog');
  await modal.waitFor();
  await modal.getByRole('button', { name: 'Copy' }).click();
  await waitForHydration(page);

  // A new row with the copy name should appear
  await expect(page.getByRole('cell', { name: new RegExp(`Copy of ${scenarioName}`) })).toBeVisible();
});
