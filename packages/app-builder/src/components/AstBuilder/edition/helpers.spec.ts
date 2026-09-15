import type { DataModelField, TableModel } from '@app-builder/models';
import { NewUndefinedAstNode } from '@app-builder/models';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { expect, it } from 'vitest';
import { getEnumValuesFromNeighbour } from './helpers';

const mccField: DataModelField = {
  id: 'mcc',
  tableId: 'tx',
  name: 'mcc',
  description: '',
  nullable: false,
  isEnum: false,
  semanticType: 'enum',
  semanticSubType: 'mcc_code',
  dataType: 'String',
  unicityConstraint: 'no_unicity_constraint',
};
const table: TableModel = {
  id: 'tx',
  name: 'transactions',
  description: '',
  semanticType: null,
  alias: '',
  captionField: '',
  fields: [mccField],
  linksToSingle: [],
  fieldOrder: ['mcc'],
};

it('offers catalog values for semantic enum neighbours without isEnum', () => {
  const parent = {
    id: 'eq',
    name: '=',
    children: [NewPayloadAstNode('mcc'), NewUndefinedAstNode()],
    namedChildren: {},
  };
  expect(getEnumValuesFromNeighbour(parent, 1, { triggerObjectTable: table, dataModel: [table] })).toEqual(
    expect.arrayContaining(['5411', '0742']),
  );
});
