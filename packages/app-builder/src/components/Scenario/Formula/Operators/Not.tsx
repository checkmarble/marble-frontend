
import { type AstNode } from '@app-builder/models';

import { Formula } from '../Formula';
import { Condition } from './Condition';

interface NotProps {
  node: AstNode;
  isRoot?: boolean;
}
export function Not({ node, isRoot }: NotProps) {
  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        {!(<Formula formula={node.children[0]} />)}
      </Condition.Item>
    </Condition.Container>
  );
}
