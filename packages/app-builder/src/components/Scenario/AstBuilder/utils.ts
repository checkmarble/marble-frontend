import { type AstNode, getAstNodeLabelName } from '@app-builder/models';
import { type AstBuilder } from '@app-builder/services/editor/ast-editor';
import * as R from 'remeda';

export function stringifyAstNode(
  astNode: AstNode,
  builder: AstBuilder
): string {
  // Return any specific AstNode toString() implementation
  const labelName = getAstNodeLabelName(astNode, builder, {
    getDefaultDisplayName: () => undefined,
  });
  if (labelName !== undefined) {
    return labelName;
  }

  // If there is no name, return a default value (should never happen since constant are handled above)
  if (!astNode.name) return '🤷‍♂️';

  // default AstNode toString() implementation
  const childrenArgs = R.pipe(
    astNode.children,
    R.map((child) => stringifyAstNode(child, builder)),
    R.join(', ')
  );

  const namedChildrenArgs = R.pipe(
    R.toPairs(astNode.namedChildren),
    R.map(([name, child]) => `${name}: ${stringifyAstNode(child, builder)}`),
    R.join(', ')
  );

  const args = [childrenArgs, namedChildrenArgs]
    .filter((arg) => arg !== '')
    .join(', ');

  return `${astNode.name}(${args})`;
}
