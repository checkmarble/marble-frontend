import { type DataModel, type NavigationOption } from '@app-builder/models';
import { describe, expect, it } from 'vitest';
import { getCustomerKpiNavigationOptions } from './LinkedTablesSelect';

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

describe('getCustomerKpiNavigationOptions', () => {
  it('only returns linked tables ordered by a timestamp field', () => {
    const nonTimestampNavigationOption: NavigationOption = {
      ...timestampNavigationOption,
      id: 'customer-transactions-status',
      orderingFieldName: 'status',
      orderingFieldId: 'transaction-status',
    };
    const unlinkedNavigationOption: NavigationOption = {
      ...timestampNavigationOption,
      id: 'customer-accounts-created-at',
      targetTableName: 'accounts',
      targetTableId: 'accounts',
      orderingFieldId: 'account-created-at',
    };
    const dataModel = [
      {
        id: 'customers',
        name: 'customers',
        navigationOptions: [timestampNavigationOption, nonTimestampNavigationOption, unlinkedNavigationOption],
        linksToSingle: [{ parentTableName: 'customers', childTableName: 'transactions' }],
        fields: [],
      },
      {
        id: 'transactions',
        name: 'transactions',
        fields: [
          { id: 'transaction-created-at', name: 'created_at', dataType: 'Timestamp' },
          { id: 'transaction-status', name: 'status', dataType: 'String' },
        ],
        linksToSingle: [],
      },
      {
        id: 'accounts',
        name: 'accounts',
        fields: [{ id: 'account-created-at', name: 'created_at', dataType: 'Timestamp' }],
        linksToSingle: [],
      },
    ] as unknown as DataModel;

    expect(getCustomerKpiNavigationOptions(dataModel, 'customers')).toEqual([timestampNavigationOption]);
  });

  it('excludes navigation options whose ordering field cannot be resolved', () => {
    const dataModel = [
      {
        id: 'customers',
        name: 'customers',
        navigationOptions: [timestampNavigationOption],
        linksToSingle: [{ parentTableName: 'customers', childTableName: 'transactions' }],
        fields: [],
      },
      { id: 'transactions', name: 'transactions', fields: [], linksToSingle: [] },
    ] as unknown as DataModel;

    expect(getCustomerKpiNavigationOptions(dataModel, 'customers')).toEqual([]);
  });
});
