import { FormatContext } from '@app-builder/contexts/FormatContext';
import { type DataModel, type DataModelField, type NavigationOption, type TableModel } from '@app-builder/models';
import { adaptNodeDto } from '@app-builder/models/astNode/ast-node';
import { getDefaultSemanticType } from '@app-builder/models/semantic-types';
import {
  addCustomerKpiFilter,
  createCustomerKpiAggregation,
  setCustomerKpiFilterOperator,
  setCustomerKpiFilterValue,
  setCustomerKpiNavigationOption,
} from './customer-kpis-ast';
import '@app-builder/tests/setup/i18next';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import i18next from 'i18next';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { type ComponentProps, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CustomerKpisConfigurationPopover } from './CustomerKpisConfigurationPopover';

const navigationOption: NavigationOption = {
  id: 'customer-transactions',
  sourceTableName: 'customers',
  sourceTableId: 'customers',
  sourceFieldName: 'id',
  sourceFieldId: 'customer-id',
  targetTableName: 'transactions',
  targetTableId: 'transactions',
  filterFieldName: 'customer_id',
  filterFieldId: 'transaction-customer-id',
  orderingFieldName: 'occurred_at',
  orderingFieldId: 'transaction-occurred-at',
  status: 'valid',
};

function field(name: string, dataType: DataModelField['dataType']): DataModelField {
  return {
    id: name,
    dataType,
    semanticType: getDefaultSemanticType(dataType),
    name,
    description: '',
    tableId: 'transactions',
    isEnum: false,
    nullable: false,
    unicityConstraint: 'no_unicity_constraint',
  };
}

function table(name: string, fields: DataModelField[], navigationOptions?: NavigationOption[]): TableModel {
  return {
    id: name,
    name,
    description: '',
    semanticType: null,
    alias: name,
    captionField: fields[0]?.name ?? 'id',
    fields,
    linksToSingle: [],
    fieldOrder: fields.map((field) => field.name),
    navigationOptions,
  };
}

const dataModel: DataModel = [
  table('customers', [field('id', 'String')], [navigationOption]),
  table('transactions', [
    field('object_id', 'String'),
    field('id', 'Int'),
    field('status', 'String'),
    field('occurred_at', 'Timestamp'),
  ]),
];

const { updateCustomerAggregate } = vi.hoisted(() => ({
  updateCustomerAggregate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@app-builder/queries/data/get-data-model', () => ({
  useDataModelQuery: () => ({ data: { dataModel }, isPending: false, isError: false, refetch: vi.fn() }),
}));
vi.mock('@app-builder/queries/get-custom-lists', () => ({ useGetCustomListsQuery: () => ({ data: [] }) }));
vi.mock('@app-builder/queries/customer-aggregates/create-customer-aggregate', () => ({
  useCreateCustomerAggregateMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock('@app-builder/queries/customer-aggregates/update-customer-aggregate', () => ({
  useUpdateCustomerAggregateMutation: () => ({ isPending: false, mutateAsync: updateCustomerAggregate }),
}));
vi.mock('@app-builder/services/organization/organization-detail', () => ({
  useOrganizationDetails: () => ({ org: { defaultScenarioTimezone: 'UTC' } }),
}));
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    Link: ({ children, to, ...props }: Omit<ComponentProps<'a'>, 'href'> & { children: ReactNode; to: string }) => (
      <a {...props} href={to}>
        {children}
      </a>
    ),
  };
});

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('CustomerKpisConfigurationPopover', () => {
  it('saves Count without a field selection and restores the field selector for other functions', async () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.label.constant = 'Transaction count';
    const onClose = vi.fn();

    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <Tooltip.Provider delayDuration={0}>
            <CustomerKpisConfigurationPopover
              objectId="customer-1"
              objectType="customers"
              aggregate={{
                id: 'aggregate-1',
                name: 'Transaction count',
                type: 'period',
                expression: adaptNodeDto(aggregation),
                time_slice: 'P1M',
              }}
              onClose={onClose}
            />
          </Tooltip.Provider>
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: i18next.t('scenarios:aggregator.average') }));
    await user.click(await screen.findByRole('option', { name: i18next.t('scenarios:aggregator.count') }));

    expect(screen.queryByRole('combobox', { name: /select.*field/i })).toBeNull();
    expect(screen.getByRole('button', { name: /add filter/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Validate' }).hasAttribute('disabled')).toBe(false);

    await user.click(screen.getByRole('combobox', { name: i18next.t('scenarios:aggregator.count') }));
    await user.click(await screen.findByRole('option', { name: i18next.t('scenarios:aggregator.average') }));

    expect(screen.getByRole('combobox', { name: /select.*field/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Validate' }).hasAttribute('disabled')).toBe(true);

    await user.click(screen.getByRole('combobox', { name: i18next.t('scenarios:aggregator.average') }));
    await user.click(await screen.findByRole('option', { name: i18next.t('scenarios:aggregator.count') }));
    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(updateCustomerAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateId: 'aggregate-1',
        expression: expect.objectContaining({
          namedChildren: expect.objectContaining({
            aggregator: expect.objectContaining({ constant: 'COUNT' }),
            fieldName: expect.objectContaining({ constant: 'object_id' }),
          }),
        }),
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps a TimestampExtract filter visible after selecting its operator', async () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.label.constant = 'Transaction count';
    aggregation.namedChildren.fieldName.constant = 'id';
    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');
    filter.namedChildren.fieldName.constant = 'occurred_at';

    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <Tooltip.Provider delayDuration={0}>
            <CustomerKpisConfigurationPopover
              objectId="customer-1"
              objectType="customers"
              aggregate={{
                id: 'aggregate-1',
                name: 'Transaction count',
                type: 'period',
                expression: adaptNodeDto(aggregation),
                time_slice: 'P1M',
              }}
              onClose={vi.fn()}
            />
          </Tooltip.Provider>
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: '...' }));
    await userEvent.click(await screen.findByRole('option', { name: 'filters by day parts' }));

    expect(screen.getByRole('button', { name: 'Validate' }).hasAttribute('disabled')).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'Jan' }));

    expect(screen.getByRole('button', { name: 'Validate' }).hasAttribute('disabled')).toBe(false);
    expect(screen.getByRole('button', { name: 'filters by day parts' })).toBeTruthy();
    expect(await screen.findByTestId('hour-range-preview')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'UTC' }).getAttribute('href')).toBe('/settings/scenarios');
  });

  it('does not offer TimestampExtract twice for the same field', async () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.label.constant = 'Transaction count';
    aggregation.namedChildren.fieldName.constant = 'id';
    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');
    filter.namedChildren.fieldName.constant = 'occurred_at';

    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <Tooltip.Provider delayDuration={0}>
            <CustomerKpisConfigurationPopover
              objectId="customer-1"
              objectType="customers"
              aggregate={{
                id: 'aggregate-1',
                name: 'Transaction count',
                type: 'period',
                expression: adaptNodeDto(aggregation),
                time_slice: 'P1M',
              }}
              onClose={vi.fn()}
            />
          </Tooltip.Provider>
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: '...' }));
    await userEvent.click(await screen.findByRole('option', { name: 'filters by day parts' }));
    await userEvent.click(screen.getByRole('button', { name: /add filter/i }));
    const fieldSelects = screen.getAllByRole('combobox', { name: /select.*field/i });
    await userEvent.click(fieldSelects.at(-1)!);
    await userEvent.click(await screen.findByRole('option', { name: 'occurred_at' }));
    await userEvent.click(screen.getByRole('button', { name: '...' }));

    expect(screen.queryByRole('option', { name: 'filters by day parts' })).toBeNull();
  });

  it('displays the configured fuzzy-match value', () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.label.constant = 'Transaction count';
    aggregation.namedChildren.fieldName.constant = 'id';
    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');
    filter.namedChildren.fieldName.constant = 'status';
    setCustomerKpiFilterOperator(filter, 'FuzzyMatch');
    setCustomerKpiFilterValue(filter, 'matched value');

    render(
      <I18nextProvider i18n={i18next}>
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
          <Tooltip.Provider delayDuration={0}>
            <CustomerKpisConfigurationPopover
              objectId="customer-1"
              objectType="customers"
              aggregate={{
                id: 'aggregate-1',
                name: 'Transaction count',
                type: 'period',
                expression: adaptNodeDto(aggregation),
                time_slice: 'P1M',
              }}
              onClose={vi.fn()}
            />
          </Tooltip.Provider>
        </FormatContext.Provider>
      </I18nextProvider>,
    );

    expect(screen.getByRole('button', { name: 'matched value' })).toBeTruthy();
  });
});
