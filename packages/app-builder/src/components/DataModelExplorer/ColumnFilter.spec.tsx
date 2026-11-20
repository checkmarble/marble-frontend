import type { DataModelField, TableModel } from '@app-builder/models/data-model';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColumnFilterChips, ColumnFilterPopover } from './ColumnFilter';
import type { ColumnFilterValue } from './column-filters';

vi.mock('@app-builder/utils/format', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@app-builder/utils/format')>()),
  useFormatLanguage: () => 'en',
  useFormatDateTime: () => () => '',
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
mockResizeObserver();
afterEach(cleanup);

const field = (partial: Partial<DataModelField>) =>
  ({ id: partial.name, name: 'f', isEnum: false, dataType: 'String', ...partial }) as DataModelField;

describe('boolean column filter', () => {
  const isFraud = field({ name: 'is_fraud', dataType: 'Bool' });

  async function openPopover(value: ColumnFilterValue | undefined, booleanDisplay?: 'yes_no') {
    const onChange = vi.fn();
    render(
      <ColumnFilterPopover field={{ ...isFraud, booleanDisplay }} value={value} onChange={onChange}>
        <button type="button">open</button>
      </ColumnFilterPopover>,
    );
    await userEvent.click(screen.getByText('open'));
    return onChange;
  }

  it('picks a value, and removes the filter when the active one is picked again', async () => {
    const onChange = await openPopover({ type: 'boolean', value: true });
    expect(screen.getByRole('radio', { name: 'common:true' }).getAttribute('aria-checked')).toBe('true');

    await userEvent.click(screen.getByRole('radio', { name: 'common:false' }));
    await userEvent.click(screen.getByRole('radio', { name: 'common:true' }));
    expect(onChange.mock.calls).toEqual([[{ type: 'boolean', value: false }], [undefined]]);
  });

  it('is worded like the cells of a yes/no column', async () => {
    await openPopover(undefined, 'yes_no');
    expect(
      screen.getAllByRole('radio').map((radio) => [radio.textContent, radio.getAttribute('aria-checked')]),
    ).toEqual([
      ['data:yes', 'false'],
      ['data:no', 'false'],
    ]);
  });
});

describe('ColumnFilterChips', () => {
  it('summarizes boolean and catalog filters with the labels of the cells', () => {
    const table = {
      fields: [
        field({ name: 'is_fraud', dataType: 'Bool', booleanDisplay: 'yes_no' }),
        field({ name: 'currency', semanticType: 'currency_code' }),
      ],
    } as TableModel;
    render(
      <ColumnFilterChips
        table={table}
        filters={{
          is_fraud: { type: 'boolean', value: false },
          currency: { type: 'enum', values: ['EUR'], catalog: 'currency' },
        }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('data:no')).toBeTruthy();
    expect(screen.getByText('EUR – Euro')).toBeTruthy();
  });
});
