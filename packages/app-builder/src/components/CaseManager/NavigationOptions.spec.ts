import { type DataModel, type NavigationOption } from '@app-builder/models';
import { describe, expect, it } from 'vitest';
import { hasTimestampOrderingOption } from './NavigationOptions';

const timestampNavigationOption: NavigationOption = {
  id: 'customer-transactions-created-at',
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

const dataModel = [
  {
    id: 'transactions',
    name: 'transactions',
    fields: [
      { id: 'transaction-created-at', name: 'created_at', dataType: 'Timestamp' },
      { id: 'transaction-status', name: 'status', dataType: 'String' },
    ],
    linksToSingle: [],
  },
] as unknown as DataModel;

describe('hasTimestampOrderingOption', () => {
  it('returns true when at least one navigation option is ordered by a timestamp field', () => {
    const nonTimestampNavigationOption: NavigationOption = {
      ...timestampNavigationOption,
      id: 'customer-transactions-status',
      orderingFieldName: 'status',
      orderingFieldId: 'transaction-status',
    };

    expect(hasTimestampOrderingOption(dataModel, [nonTimestampNavigationOption, timestampNavigationOption])).toBe(true);
  });

  it('returns false when no navigation option is ordered by a timestamp field', () => {
    const nonTimestampNavigationOption: NavigationOption = {
      ...timestampNavigationOption,
      orderingFieldName: 'status',
      orderingFieldId: 'transaction-status',
    };

    expect(hasTimestampOrderingOption(dataModel, [])).toBe(false);
    expect(hasTimestampOrderingOption(dataModel, [nonTimestampNavigationOption])).toBe(false);
  });
});
