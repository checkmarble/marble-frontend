import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import {
  getValueSwitchCellKey,
  parseValueSwitchAstNode,
  valueSwitchModelToAst,
} from '@app-builder/models/astNode/value-switch';
import type { DataModelField } from '@app-builder/models/data-model';
import { expect, it } from 'vitest';
import { getValueSwitchFieldOption } from './field-option';

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
    { key: 'ok', color: 'green' },
    { key: 'other', color: 'gray' },
  ],
};
const accessor = NewPayloadAstNode('status');

it.each(['Int', 'Float', 'Bool', 'Timestamp'] as const)(
  'excludes %s fields from ValueSwitch dimensions',
  (dataType) => {
    expect(getValueSwitchFieldOption(accessor, { ...field, dataType })).toBeUndefined();
  },
);
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
