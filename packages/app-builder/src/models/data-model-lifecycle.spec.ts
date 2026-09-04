import { adaptUpdateTableValue } from '@app-builder/components/Data/SemanticTables/EditTable/updateTable-adapter';
import type { SemanticTableFormValues } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import type { CreateTableValue } from '@app-builder/schemas/data';
import type { DataModelDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptDataModel, createTableValueToCreateTableBody } from './data-model';

describe('table lifecycle adapters', () => {
  it('adapts lifecycle configuration from the data model API', () => {
    const dto: DataModelDto = {
      tables: {
        transactions: {
          id: 'table-id',
          name: 'transactions',
          description: '',
          fields: {},
          lifecycle: {
            enabled: true,
            delete_stale_rows_after: 'P3M',
            delete_active_rows_after: 'P2Y',
          },
        },
      },
    };

    expect(adaptDataModel(dto)[0]?.lifecycle).toEqual({
      enabled: true,
      deleteStaleRowsAfter: 'P3M',
      deleteActiveRowsAfter: 'P2Y',
    });
  });

  it('defaults missing lifecycle configuration to disabled', () => {
    const dto: DataModelDto = {
      tables: {
        transactions: { id: 'table-id', name: 'transactions', description: '', fields: {} },
      },
    };

    expect(adaptDataModel(dto)[0]?.lifecycle).toEqual({ enabled: false });
  });

  it('normalizes null lifecycle durations from the data model API', () => {
    const dto: DataModelDto = {
      tables: {
        transactions: {
          id: 'table-id',
          name: 'transactions',
          description: '',
          fields: {},
          lifecycle: {
            enabled: true,
            delete_stale_rows_after: null,
            delete_active_rows_after: null,
          },
        },
      },
    };

    expect(adaptDataModel(dto)[0]?.lifecycle).toEqual({ enabled: true });
  });

  it('reads the legacy misspelled active-row duration', () => {
    const legacyLifecycle = { enabled: true, delete_active_rows_aftger: 'P1Y' };
    const dto: DataModelDto = {
      tables: {
        transactions: {
          id: 'table-id',
          name: 'transactions',
          description: '',
          fields: {},
          lifecycle: legacyLifecycle,
        },
      },
    };

    expect(adaptDataModel(dto).at(0)?.lifecycle.deleteActiveRowsAfter).toBe('P1Y');
  });

  it('passes lifecycle configuration to table creation', () => {
    const value: CreateTableValue = {
      name: 'transactions',
      semantic_type: 'transaction',
      fields: [],
      links: [],
      primary_ordering_field: 'updated_at',
      lifecycle: {
        enabled: true,
        delete_stale_rows_after: 'P3M',
        delete_active_rows_after: 'P2Y',
      },
    };

    expect(createTableValueToCreateTableBody(value).lifecycle).toEqual(value.lifecycle);
  });

  it('only includes lifecycle in a table update when it changed', () => {
    const tableState: SemanticTableFormValues = {
      tableId: 'table-id',
      name: 'transactions',
      alias: 'Transactions',
      entityType: 'transaction',
      subEntity: 'unset',
      belongsToTableId: '',
      fields: [],
      mainTimestampFieldName: 'updated_at',
      links: [],
      metaData: {},
      isCanceled: false,
      isVisited: true,
      lifecycle: {
        enabled: true,
        deleteStaleRowsAfter: { value: 3, unit: 'months' },
        deleteActiveRowsAfter: { value: 2, unit: 'years' },
      },
    };

    const unchanged = adaptUpdateTableValue(tableState, [], [], [], new Map());
    const changed = adaptUpdateTableValue(
      tableState,
      [{ type: 'table', operation: 'MOD', changedProperties: ['lifecycle'] }],
      [],
      [],
      new Map(),
    );

    expect(unchanged.lifecycle).toBeUndefined();
    expect(changed.lifecycle).toEqual({
      enabled: true,
      delete_stale_rows_after: 'P3M',
      delete_active_rows_after: 'P2Y',
    });
  });

  it('sends null to clear an updated lifecycle duration', () => {
    const tableState: SemanticTableFormValues = {
      tableId: 'table-id',
      name: 'transactions',
      alias: 'Transactions',
      entityType: 'transaction',
      subEntity: 'unset',
      belongsToTableId: '',
      fields: [],
      mainTimestampFieldName: 'updated_at',
      links: [],
      metaData: {},
      isCanceled: false,
      isVisited: true,
      lifecycle: {
        enabled: true,
        deleteStaleRowsAfter: { unit: 'months' },
        deleteActiveRowsAfter: { value: 2, unit: 'years' },
      },
    };

    expect(
      adaptUpdateTableValue(
        tableState,
        [{ type: 'table', operation: 'MOD', changedProperties: ['lifecycle'] }],
        [],
        [],
        new Map(),
      ).lifecycle,
    ).toEqual({
      enabled: true,
      delete_stale_rows_after: null,
      delete_active_rows_after: 'P2Y',
    });
  });
});
