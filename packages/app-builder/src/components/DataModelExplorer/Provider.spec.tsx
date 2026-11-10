import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataModelExplorerContext, DataModelExplorerProvider } from './Provider';
import { type DataModelExplorerNavigationTab } from './types';

const tab = (targetTableName: string): DataModelExplorerNavigationTab => ({
  pivotObject: { pivotValue: 'c1', pivotObjectName: 'companies', isIngested: true },
  sourceObject: { object_id: 'c1' },
  sourceTableName: 'companies',
  sourceFieldName: 'object_id',
  targetTableName,
  filterFieldName: 'company_id',
  orderingFieldName: 'updated_at',
});

describe('DataModelExplorerProvider', () => {
  it('keeps the filters of a tab while another tab is active, and drops them on a new exploration', () => {
    const { result } = renderHook(() => DataModelExplorerContext.useValue(), { wrapper: DataModelExplorerProvider });
    const transactions = tab('transactions');
    const accounts = tab('accounts');
    const filters = { status: { type: 'text' as const, value: 'pending' } };

    act(() => result.current.startNavigation(transactions));
    act(() => result.current.setExplorerState({ filtersByTab: { transactions: filters } }));
    act(() =>
      result.current.setExplorerState({
        tabs: [transactions, accounts],
        currentTab: accounts,
        lastActiveTab: transactions,
      }),
    );
    act(() => result.current.setExplorerState({ currentTab: transactions, lastActiveTab: accounts }));

    expect(result.current.explorerState?.filtersByTab).toEqual({ transactions: filters });

    act(() => result.current.startNavigation(accounts));

    expect(result.current.explorerState?.filtersByTab).toEqual({});
  });
});
