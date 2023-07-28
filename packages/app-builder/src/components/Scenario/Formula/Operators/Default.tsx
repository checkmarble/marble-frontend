import { type AstNode } from '@app-builder/models';
import clsx from 'clsx';

import { Condition } from './Condition';

function DefaultValue(node: AstNode) {
  let value = (node.name ?? "") + "(";
  for (const child of node.children) {
    if (child.name === null) {
      value += child.constant ?? "" + ", "
    } else {
      value += DefaultValue(child) + ", "
    }
  }
  Object.keys(node.namedChildren).forEach(key => {
    const child = node.namedChildren[key];
    if (child.name === null) {
      const constant = (child.constant ?? "").toString()
      value += key + ": " + constant + ", "
    } else {
      value += key + ": " + DefaultValue(child) + ", "
    }
  });
  if (value.slice(-2) === ", ") {
    value = value.substring(0, value.length - 2)
  }
  value += ")"
  return value
}

export function Default({
  node,
  isRoot,
}: {
  node: AstNode;
  isRoot?: boolean;
}) {
  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        <span
          className={clsx(
            'text-grey-100 flex whitespace-pre text-center font-medium',
          )}
        >
          {DefaultValue(node)}
        </span>
      </Condition.Item>
    </Condition.Container>
  );
}
