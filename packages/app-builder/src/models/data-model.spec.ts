import { adaptUpdateTableValue } from '@app-builder/components/Data/SemanticTables/EditTable/updateTable-adapter';
import type { TableField } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import type { FieldDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptDataModel, getDeclaredSemanticType, primitiveTypes } from './data-model';
import { getDefaultSemanticType } from './semantic-types';

function readField(overrides: Partial<FieldDto> & { metadata?: Record<string, unknown>; semantic_type?: string } = {}) {
  const field: FieldDto = {
    id: 'field',
    table_id: 'table',
    name: 'email',
    description: '',
    data_type: 'String',
    is_enum: false,
    nullable: false,
    unicity_constraint: 'no_unicity_constraint',
    ...overrides,
  };
  return adaptDataModel({
    tables: { table: { id: 'table', name: 'customers', description: '', fields: { email: field } } },
  })[0]!.fields[0]!;
}

describe('data model semantic defaults', () => {
  it.each([
    ['String', 'email', 'text'],
    ['Int', 'amount', 'number'],
    ['Float', 'amount', 'number'],
    ['Timestamp', 'date_of_birth', 'timestamp'],
    ['Bool', 'card_is_3ds', undefined],
    ['Coords', 'location', 'text'],
    ['IpAddress', 'ip', 'text'],
    ['unknown', 'email', 'text'],
  ] as const)('defaults %s without inferring from %s', (data_type, name, semanticType) => {
    const field = readField({ data_type, name });
    expect(field.semanticType).toBe(semanticType);
    expect(field.semanticSubType).toBeUndefined();
    expect(getDeclaredSemanticType(field)).toBeUndefined();
  });

  it('does not infer enum semantics or subtypes on read', () => {
    expect(readField({ is_enum: true })).toMatchObject({ semanticType: 'text', semanticSubType: undefined });
  });

  it('preserves declared semantics and metadata precedence', () => {
    const field = readField({
      semantic_type: 'text',
      metadata: { semanticTypeForFront: 'link', semanticSubType: 'email' },
    });
    expect(field).toMatchObject({ semanticType: 'link', semanticSubType: 'email', semanticTypeIsFallback: false });
    expect(getDeclaredSemanticType(field)).toBe('link');
    expect(readField({ semantic_type: 'text' }).semanticSubType).toBeUndefined();
  });

  it('retains fallback provenance across serialization', () => {
    expect(JSON.parse(JSON.stringify(readField()))).toMatchObject({ semanticTypeIsFallback: true });
  });

  it.each(primitiveTypes)('uses the same generic default for %s arrays', (dataType) => {
    expect(getDefaultSemanticType(`${dataType}[]`)).toBe(getDefaultSemanticType(dataType));
  });

  it('leaves boolean array semantics empty', () => {
    expect(getDefaultSemanticType('Bool[]')).toBeUndefined();
  });

  it('defaults derived data to text', () => {
    expect(getDefaultSemanticType('DerivedData')).toBe('text');
  });

  it.each([true, false])('preserves supervised save detection when fallback is %s', (isFallback) => {
    const rawField = readField(isFallback ? {} : { semantic_type: 'text' });
    const formField: TableField = {
      ...rawField,
      dataType: 'String',
      semanticType: 'text',
      alias: 'email',
      hidden: false,
      isNew: false,
    };
    const result = adaptUpdateTableValue(
      {
        tableId: 'table',
        name: 'customers',
        alias: '',
        entityType: 'unset',
        subEntity: 'unset',
        belongsToTableId: '',
        fields: [formField],
        mainTimestampFieldName: '',
        links: [],
        metaData: {},
        isCanceled: false,
        isVisited: true,
      },
      [{ type: 'field', operation: 'MOD', objectId: 'field' }],
      [formField],
      [],
      new Map(),
      undefined,
      [rawField],
    );
    const operation = result.fields?.[0];
    expect(operation?.op).toBe('MOD');
    if (operation?.op !== 'MOD') throw new Error('Expected a field modification');
    if (isFallback) {
      expect(operation.data.metadata).toMatchObject({ semanticTypeForFront: 'text' });
    } else {
      expect(operation.data.metadata).toBeUndefined();
    }
  });
});
