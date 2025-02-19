import { type IdLessAstNode } from '@app-builder/models';
import { type CustomListAccessAstNode } from '@app-builder/models/astNode/custom-list';
import { type CustomList } from '@app-builder/models/custom-list';
import * as R from 'remeda';

export function getCustomListAccessCustomList(
  astNode: IdLessAstNode<CustomListAccessAstNode>,
  context: {
    customLists: CustomList[];
  },
) {
  return R.pipe(
    context.customLists,
    R.find(({ id }) => id === astNode.namedChildren.customListId.constant),
  );
}
