import { type LabelledAst, NewCustomListAstNode } from '@app-builder/models';
import { type CustomList } from '@marble-api';

export function newCustomListLabelledAst(customList: CustomList): LabelledAst {
  return {
    name: customList.name,
    description: customList.description,
    operandType: 'CustomList',
    //TODO(combobox): infer/get customList.dataType
    dataType: 'unknown',
    astNode: NewCustomListAstNode(customList.id),
  };
}
