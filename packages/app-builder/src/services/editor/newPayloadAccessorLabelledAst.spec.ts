import { NewConstantAstNode, type PayloadAstNode } from '@app-builder/models';
import {
  transactionFieldName,
  transactionTable,
} from '@app-builder/models/data-model.dummy';

import { newPayloadAccessorsLabelledAst } from './newPayloadAccessorLabelledAst';

describe('newPayloadAccessorsLabelledAst', () => {
  it('return the corresponding data model field', () => {
    const payloadAst: PayloadAstNode = {
      name: 'Payload',
      children: [NewConstantAstNode({ constant: 'name' })],
      namedChildren: {},
    };

    expect(
      newPayloadAccessorsLabelledAst({
        triggerObjectType: transactionTable,
        node: payloadAst,
      })
    ).toStrictEqual({
      label: 'name',
      tooltip: '',
      astNode: payloadAst,
      dataModelField: transactionFieldName,
    });
  });
});
