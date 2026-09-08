import { type DataModel, type NavigationOption } from '@app-builder/models';
import {
  isBinaryAggregationFilter,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  isUnaryAggregationFilter,
} from '@app-builder/models/astNode/aggregation';
import { describe, expect, it } from 'vitest';
import {
  addCustomerKpiFilter,
  createCustomerKpiAggregation,
  getCustomerKpiNavigationOption,
  isCustomerKpiAggregationComplete,
  setCustomerKpiFilterField,
  setCustomerKpiFilterOperator,
  setCustomerKpiFilterValue,
  setCustomerKpiNavigationOption,
} from './customer-kpis-ast';

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
  orderingFieldName: 'created_at',
  orderingFieldId: 'transaction-created-at',
  status: 'valid',
};

const alternativeNavigationOption: NavigationOption = {
  ...navigationOption,
  id: 'customer-transactions-updated-at',
  orderingFieldName: 'updated_at',
  orderingFieldId: 'transaction-updated-at',
};

const dataModel = [
  {
    name: 'customers',
    navigationOptions: [navigationOption, alternativeNavigationOption],
    fields: [
      { name: 'id', dataType: 'Int' },
      { name: 'status', dataType: 'String' },
    ],
  },
  {
    name: 'transactions',
    fields: [
      { name: 'id', dataType: 'Int' },
      { name: 'status', dataType: 'String' },
    ],
  },
] as DataModel;

describe('customer KPI aggregation AST', () => {
  it('keeps customer and date payload filters while managing user filters in the AST', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.label.constant = 'Transaction count';
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.fieldName.constant = 'id';

    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');
    filter.namedChildren.fieldName.constant = 'status';
    setCustomerKpiFilterOperator(filter, '=');
    setCustomerKpiFilterValue(filter, 'completed');

    expect(getCustomerKpiNavigationOption(aggregation, 'customers', dataModel)).toEqual(navigationOption);
    expect(aggregation.namedChildren.filters.children).toHaveLength(4);
    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);
  });

  it('keeps the selected navigation option when a table has multiple options', () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, alternativeNavigationOption);

    expect(getCustomerKpiNavigationOption(aggregation, 'customers', dataModel)).toEqual(alternativeNavigationOption);
  });

  it('preserves operand transitions for unary, binary, list, and fuzzy-match filters', () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');

    setCustomerKpiFilterOperator(filter, 'IsEmpty');
    expect(isUnaryAggregationFilter(filter)).toBe(true);

    setCustomerKpiFilterOperator(filter, '=');
    expect(isBinaryAggregationFilter(filter)).toBe(true);
    if (!isBinaryAggregationFilter(filter)) throw new Error('Expected a binary filter');
    expect(filter.namedChildren.value.name).toBe('Undefined');

    setCustomerKpiFilterOperator(filter, 'FuzzyMatch');
    expect(isComplexAggregationFilter(filter)).toBe(true);
    if (!isComplexAggregationFilter(filter)) throw new Error('Expected a complex filter');
    expect(isFuzzyMatchFilterOptionsAstNode(filter.namedChildren.value)).toBe(true);
    expect(filter.namedChildren.value.namedChildren.value.name).toBe('Undefined');

    setCustomerKpiFilterOperator(filter, 'IsInList');
    expect(isBinaryAggregationFilter(filter)).toBe(true);
    if (!isBinaryAggregationFilter(filter)) throw new Error('Expected a binary filter');
    setCustomerKpiFilterValue(filter, { type: 'stringList', values: ['completed'] });
    expect(filter.namedChildren.value).toMatchObject({ constant: ['completed'] });
  });

  it('resets a filter operator and value when its field changes', () => {
    const aggregation = createCustomerKpiAggregation();
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');

    filter.namedChildren.fieldName.constant = 'status';
    setCustomerKpiFilterOperator(filter, '=');
    setCustomerKpiFilterValue(filter, 'completed');
    setCustomerKpiFilterField(aggregation, 0, 'id');

    const resetFilter = aggregation.namedChildren.filters.children[3];
    if (!resetFilter || !isBinaryAggregationFilter(resetFilter)) throw new Error('Expected a binary filter');
    expect(resetFilter.namedChildren.fieldName.constant).toBe('id');
    expect(resetFilter.namedChildren.operator.constant).toBeNull();
    expect(resetFilter.namedChildren.value.name).toBe('Undefined');
  });

  it('rejects incompatible aggregate and filter field types', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.label.constant = 'Average status';
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.fieldName.constant = 'status';

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);

    aggregation.namedChildren.fieldName.constant = 'id';
    addCustomerKpiFilter(aggregation);
    const filter = aggregation.namedChildren.filters.children[3];
    if (!filter) throw new Error('Expected a user filter');
    filter.namedChildren.fieldName.constant = 'id';
    setCustomerKpiFilterOperator(filter, 'FuzzyMatch');

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);
  });
});
