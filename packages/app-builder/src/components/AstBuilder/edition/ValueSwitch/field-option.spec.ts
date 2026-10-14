import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import {
  getValueSwitchCellKey,
  parseValueSwitchAstNode,
  valueSwitchModelToAst,
} from '@app-builder/models/astNode/value-switch';
import type { DataModelField } from '@app-builder/models/data-model';
import { expect, it } from 'vitest';
import { getValueSwitchFieldOption, isNumericDimension } from './field-option';

const field: DataModelField = {
  id: 'status',
  tableId: 'table',
  name: 'status',
  description: '',
  nullable: false,
  isEnum: false,
  semanticType: 'enum',
  dataType: 'String',
  unicityConstraint: 'no_unicity_constraint',
  semanticSubType: 'key_color_value',
  enumValues: [
    { key: 'ok', color: 'var(--color-enum-green)' },
    { key: 'other', color: 'var(--color-enum-grey)' },
  ],
};
const accessor = NewPayloadAstNode('status');

it.each(['Bool', 'Timestamp'] as const)('excludes %s fields from ValueSwitch dimensions', (dataType) => {
  expect(getValueSwitchFieldOption(accessor, { ...field, dataType })).toBeUndefined();
});
it.each(['Int', 'Float'] as const)('includes %s fields without discrete known values', (dataType) => {
  expect(
    getValueSwitchFieldOption(accessor, {
      ...field,
      dataType,
      values: [1, 2],
    }),
  ).toMatchObject({
    field: expect.objectContaining({ dataType }),
    knownValues: [],
  });
});
it('carries resolved metadata and closed-list options without stale keys', () => {
  expect(getValueSwitchFieldOption(accessor, field, ['stale'])).toMatchObject({
    field,
    closed: true,
    knownValues: ['ok', 'other'],
  });
});
it.each([1, 2] as const)(
  'keeps keys and stale values in a %s-dimension AST with independent else score',
  (dimensionCount) => {
    const dimensions = [
      { type: 'field' as const, field: accessor, values: ['ok', 'stale'] },
      ...(dimensionCount === 2 ? [{ type: 'risk-level' as const, values: [1] }] : []),
    ];
    const thresholds = { [getValueSwitchCellKey(dimensionCount === 2 ? ['stale', 1] : ['stale'])]: 42 };
    const ast = valueSwitchModelToAst({ dimensionCount, dimensions, thresholds, fallback: 9 });
    expect(ast.namedChildren.fallback.constant).toBe(9);
    expect(parseValueSwitchAstNode(ast)).toMatchObject({
      dimensions: [{ values: ['ok', 'stale'] }, ...(dimensionCount === 2 ? [{ values: [1] }] : [])],
      fallback: 9,
    });
  },
);

const numericFieldDimension = { type: 'field' as const, field: accessor, values: [1, 2, 3] };
const stringFieldDimension = { type: 'field' as const, field: accessor, values: ['ok', 'other'] };

it('does not treat customer risk level as a numeric band', () => {
  expect(isNumericDimension({ type: 'risk-level', values: [1, 2, 3, 4] })).toBe(false);
});
it.each(['Int', 'Float'] as const)('treats %s fields as numeric bands', (dataType) => {
  expect(isNumericDimension(numericFieldDimension, { ...field, dataType })).toBe(true);
});
it('does not treat String fields as numeric bands', () => {
  expect(isNumericDimension(stringFieldDimension, field)).toBe(false);
});
it('falls back to stored numeric values when the field is missing', () => {
  expect(isNumericDimension(numericFieldDimension)).toBe(true);
  expect(isNumericDimension(stringFieldDimension)).toBe(false);
  expect(isNumericDimension({ type: 'field', field: accessor, values: [] })).toBe(false);
});
it('rejects a missing dimension', () => {
  expect(isNumericDimension(null)).toBe(false);
  expect(isNumericDimension(undefined)).toBe(false);
});
