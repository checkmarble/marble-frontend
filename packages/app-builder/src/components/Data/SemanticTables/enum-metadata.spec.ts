import { adaptDataModelField } from '@app-builder/models/data-model';
import { createFieldValuesSchema, editSemanticTablePayloadSchema } from '@app-builder/schemas/data';
import i18next from 'i18next';
import type { FieldDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptTableField, defaultCreateTableFormValues, validateValues } from './CreateTable/createTable-types';
import { adaptFieldToTableField } from './EditTable/adapt-field';
import { adaptUpdateTableValue } from './EditTable/updateTable-adapter';
import type { TableField } from './Shared/semanticData-types';

const field: TableField = {
  id: 'field',
  name: 'status',
  description: '',
  dataType: 'String',
  tableId: 'table',
  isEnum: false,
  nullable: false,
  alias: 'Status',
  hidden: false,
  unicityConstraint: 'no_unicity_constraint',
  semanticType: 'enum',
  semanticSubType: 'key_color_value',
  isNew: false,
  enumValues: [
    { key: 'ok', color: '#46BB7F' },
    { key: 'other', color: '#838292' },
  ],
  countryCodeFormat: 'alpha3',
};
function dto(metadata: unknown): FieldDto & { metadata: unknown } {
  return {
    id: field.id,
    name: field.name,
    data_type: field.dataType,
    description: '',
    is_enum: false,
    nullable: false,
    table_id: field.tableId,
    unicity_constraint: 'no_unicity_constraint',
    metadata,
  };
}

describe('enum metadata persistence', () => {
  it.each(['Completed', '', null, 123])(
    'ignores legacy database labels %j when reading and saving metadata',
    (value) => {
      const metadata = {
        semanticTypeForFront: 'enum',
        semanticSubType: 'key_color_value',
        enumValues: [{ key: 'COMPLETED', color: '#46BB7F', value }],
      };
      const adapted = adaptDataModelField(dto(metadata));
      expect(adapted.enumValues).toEqual([{ key: 'COMPLETED', color: '#46BB7F' }]);
      const saved = createFieldValuesSchema.parse(adaptTableField(adaptFieldToTableField(adapted)));
      expect(saved.metadata?.['enumValues']).toEqual([{ key: 'COMPLETED', color: '#46BB7F' }]);
    },
  );

  it('survives creation schema, API adaptation, and editor restoration', () => {
    const created = createFieldValuesSchema.parse(adaptTableField(field));
    expect(created.is_enum).toBe(true);
    const adapted = adaptDataModelField({ ...dto(created.metadata), is_enum: created.is_enum ?? false });
    expect(adapted).toMatchObject({ isEnum: true, enumValues: field.enumValues, countryCodeFormat: 'alpha3' });
    expect(adaptFieldToTableField(adapted)).toMatchObject({
      enumValues: field.enumValues,
      countryCodeFormat: 'alpha3',
    });
  });
  it.each([{ countryCodeFormat: 'alpha2' as const }, { enumValues: [{ key: 'ok', color: '#DB5F4A' as const }] }])(
    'detects and persists metadata-only updates %j',
    (patch) => {
      const current = { ...field, ...patch };
      const payload = adaptUpdateTableValue(
        { ...defaultCreateTableFormValues, tableId: 'table', fields: [current] },
        [{ type: 'field', operation: 'MOD', objectId: field.id }],
        [field],
        [],
        new Map(),
      );
      expect(editSemanticTablePayloadSchema.safeParse(payload).success).toBe(true);
      expect(payload.fields?.[0]?.data).toMatchObject({ metadata: patch });
      const operation = payload.fields?.[0];
      if (!operation || operation.op !== 'MOD') throw new Error('Expected update');
      expect(adaptDataModelField(dto(operation.data.metadata))).toMatchObject(patch);
    },
  );
  it('does not send unchanged entry arrays as metadata updates', () => {
    const current = { ...field, enumValues: field.enumValues?.map((entry) => ({ ...entry })) };
    const payload = adaptUpdateTableValue(
      { ...defaultCreateTableFormValues, fields: [current] },
      [{ type: 'field', operation: 'MOD', objectId: field.id }],
      [field],
      [],
      new Map(),
    );
    expect(payload.fields?.[0]?.data).not.toHaveProperty('metadata');
  });
  it.each([
    null,
    [],
    'invalid',
    { enumValues: [{ key: 'x', color: 'invalid' }], countryCodeFormat: 'alpha4' },
    { enumValues: [field.enumValues?.[0], field.enumValues?.[0]] },
  ])('defensively rejects malformed metadata %j', (metadata) => {
    const adapted = adaptDataModelField(dto(metadata));
    expect(adapted.enumValues).toBeUndefined();
    expect(adapted.countryCodeFormat).toBeUndefined();
  });
  it('restores a legacy enum without inferring a non-enum semantic type', () => {
    expect(adaptFieldToTableField(adaptDataModelField({ ...dto({}), is_enum: true })).semanticType).toBe('enum');
  });
  it.each([
    undefined,
    [],
    [{ key: '', color: '#838292' as const }],
    [{ key: ' ', color: '#838292' as const }],
    [field.enumValues![0]!, field.enumValues![0]!],
  ])('validates missing, incomplete and duplicate entries %j', (enumValues) => {
    const result = validateValues(
      { ...defaultCreateTableFormValues, fields: [{ ...field, enumValues }] },
      'fields',
      i18next.getFixedT('en', ['data']),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected errors');
    expect(result.errors.some((error) => error.kind === 'field' && error.fieldId === field.id)).toBe(true);
  });
});
