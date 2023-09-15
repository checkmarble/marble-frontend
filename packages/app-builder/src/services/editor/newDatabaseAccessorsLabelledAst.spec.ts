import {
  type DatabaseAccessAstNode,
  NewConstantAstNode,
} from '@app-builder/models';
import {
  accountAndTransactionDataModel,
  transactionFieldName,
} from '@app-builder/models/data-model.dummy';

import { newDatabaseAccessorsLabelledAst } from './newDatabaseAccessorsLabelledAst';

describe('newDatabaseAccessorsLabelledAst', () => {
  it('return the corresponding data model field', () => {
    const databaseAccessAst: DatabaseAccessAstNode = {
      name: 'DatabaseAccess',
      children: [],
      namedChildren: {
        fieldName: NewConstantAstNode({ constant: 'name' }),
        path: NewConstantAstNode({ constant: ['account'] }),
        tableName: NewConstantAstNode({ constant: 'transactions' }),
      },
    };

    expect(
      newDatabaseAccessorsLabelledAst({
        dataModel: accountAndTransactionDataModel,
        node: databaseAccessAst,
      })
    ).toStrictEqual({
      label: 'account.name',
      tooltip: '',
      astNode: databaseAccessAst,
      dataModelField: transactionFieldName,
    });
  });
});
