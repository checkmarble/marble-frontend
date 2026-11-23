import { type DataModel, type NavigationOption } from '@app-builder/models';
import {
  isBinaryAggregationFilter,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  NewFuzzyMatchFilterOptionsAstNode,
  NewTimestampExtractFilterOptionsAstNode,
} from '@app-builder/models/astNode/aggregation';
import { NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { describe, expect, it } from 'vitest';
import {
  createCustomerKpiAggregation,
  getCustomerKpiNavigationOption,
  isCustomerKpiAggregationComplete,
  setCustomerKpiFilterValue,
  setCustomerKpiNavigationOption,
} from './customer-kpis-ast';
import { addUserFilter } from './customer-kpis-ast.test-helpers';

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
      { name: 'object_id', dataType: 'String' },
      { name: 'id', dataType: 'Int' },
      { name: 'status', dataType: 'String' },
      { name: 'occurred_at', dataType: 'Timestamp' },
    ],
  },
] as DataModel;

describe('customer KPI aggregation AST', () => {
  it('keeps customer and date payload filters while managing user filters in the AST', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.label.constant = 'Transaction count';
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.fieldName.constant = 'id';

    const filter = addUserFilter(aggregation, { fieldName: 'status', operator: '=' });
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

  it('keeps Count complete when changing the navigation option without selecting a field', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.aggregator.constant = 'COUNT';
    aggregation.namedChildren.label.constant = 'Transaction count';
    setCustomerKpiNavigationOption(aggregation, navigationOption);

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);

    setCustomerKpiNavigationOption(aggregation, alternativeNavigationOption);

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);
    expect(aggregation.namedChildren.fieldName.constant).toBe('object_id');
  });

  it('rejects incompatible aggregate and filter field types', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.label.constant = 'Average status';
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.fieldName.constant = 'status';

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);

    aggregation.namedChildren.fieldName.constant = 'id';
    addUserFilter(aggregation, {
      fieldName: 'id',
      operator: 'FuzzyMatch',
      value: NewFuzzyMatchFilterOptionsAstNode(),
    });

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);
  });

  it('validates ordinary filter operands, including scalar constants and payload fields', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.label.constant = 'Transactions';
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.fieldName.constant = 'id';
    const filter = addUserFilter(aggregation, { fieldName: 'status', operator: '=' });
    if (!isBinaryAggregationFilter(filter)) throw new Error('Expected a binary filter');

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);
    for (const value of ['completed', 0, false]) {
      filter.namedChildren.value = NewConstantAstNode({ constant: value });
      expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);
    }
    filter.namedChildren.value = NewPayloadAstNode('status');
    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);
    filter.namedChildren.value = NewConstantAstNode({ constant: [] });
    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);
    filter.namedChildren.value = NewUndefinedAstNode();
    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(false);

    aggregation.namedChildren.filters.children.splice(3, 1);
    const fuzzyFilter = addUserFilter(aggregation, {
      fieldName: 'status',
      operator: 'FuzzyMatch',
      value: NewFuzzyMatchFilterOptionsAstNode({ value: NewConstantAstNode({ constant: 'completed' }) }),
    });
    if (
      !isComplexAggregationFilter(fuzzyFilter) ||
      !isFuzzyMatchFilterOptionsAstNode(fuzzyFilter.namedChildren.value)
    ) {
      throw new Error('Expected a fuzzy-match filter');
    }
    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);
  });

  it('accepts complete multiple-of and timestamp-extract filters', () => {
    const aggregation = createCustomerKpiAggregation();
    aggregation.namedChildren.label.constant = 'Transaction count';
    setCustomerKpiNavigationOption(aggregation, navigationOption);
    aggregation.namedChildren.fieldName.constant = 'id';

    addUserFilter(aggregation, {
      fieldName: 'id',
      operator: 'IsMultipleOf',
      value: NewConstantAstNode({ constant: 10 }),
    });

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);

    aggregation.namedChildren.filters.children.splice(3, 1);
    addUserFilter(aggregation, {
      fieldName: 'occurred_at',
      operator: 'TimestampExtract',
      value: NewTimestampExtractFilterOptionsAstNode({ part: 'month', ranges: [[1, 1]] }),
    });

    expect(isCustomerKpiAggregationComplete(aggregation, 'customers', dataModel)).toBe(true);
  });
});
