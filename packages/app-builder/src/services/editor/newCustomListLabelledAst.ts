import { type LabelledAst, NewCustomListAstNode } from '@app-builder/models';
import { type CustomList } from '@marble-api';

export function newCustomListLabelledAst(customList: CustomList): LabelledAst {
  return {
    label: customList.name,
    tooltip: customList.description,
    astNode: NewCustomListAstNode(customList.id),
    dataModelField: null,
  };
}
