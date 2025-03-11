import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import { waitForThen } from 'tests/common/utils';

test('Create a simple scenario', async ({ page }) => {
  await page.goto('/scenarios');
  
  const scenarioName = crypto.randomUUID();

  await page.getByRole('button', { name: 'New Scenario' }).click();

  await waitForThen(
    page,
    page.getByRole('textbox', { name: 'Name' }),
    async (field) => await field.fill(scenarioName), 
  );

  await page.getByRole('textbox', { name: 'Description' }).fill('DESC');

  await waitForThen(
    page,
    page.getByRole('combobox'),
    async (box) => await box.click(),
  );

  await page.waitForTimeout(200);

  await waitForThen(
    page,
    page.getByRole('option', { name: 'transactions' }),
    async (option) => await option.click(),
  );

  await page.getByRole('button', { name: 'Save' }).click();

  await waitForThen(
    page,
    page.getByRole('button', { name: 'Add trigger condition' }),
    async (button) => await button.click(),
  );

  await page.getByRole('button', { name: 'Condition', exact: true }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).first().click();
  await page.getByRole('option', { name: 'transactions' }).hover();
  await page.getByText('amount').click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '>' }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).click();
  await page.getByRole('combobox', { name: 'Select or create an operand' }).fill('100');
  await page.getByRole('combobox', { name: 'Select or create an operand' }).press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Rules' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Add a Rule Add a rule to the' }).click();
  await page.getByRole('button', { name: 'Group', exact: true }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).first().click();
  await page.getByRole('option', { name: 'transactions' }).hover();
  await page.getByText('amount').click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '>' }).click();
  await page.getByRole('button', { name: 'Select an operand...' }).click();
  await page.getByRole('combobox', { name: 'Select or create an operand' }).fill('9000');
  await page.getByRole('combobox', { name: 'Select or create an operand' }).press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('listitem').filter({ hasText: 'Scenarios' }).getByRole('link').click();

  await expect(page.getByRole('link', { name: `${scenarioName} DESC`})).toBeVisible();

  await page.getByRole('link', { name: `${scenarioName} DESC` }).click();
  await page.getByRole('link', { name: 'draft' }).click();

  await expect(page.getByRole('button', { name: 'edit_operand.operator_type.' })).toHaveText('amount');
  await expect(page.getByRole('combobox')).toHaveText('>');
  await expect(page.getByRole('button', { name: 'Number 100' })).toBeVisible();
});