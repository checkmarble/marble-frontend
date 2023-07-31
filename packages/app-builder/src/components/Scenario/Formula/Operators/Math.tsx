import { type AstNode } from '@app-builder/models';
import { useGetOperatorName } from '@app-builder/services/editor';
import React from 'react';

import { Formula } from '../Formula';
import { Condition } from './Condition';

interface MathProps {
  node: AstNode;
  isRoot?: boolean;
}

export function Math({ node, isRoot }: MathProps) {
  const getOperatorName = useGetOperatorName();

  return (
    <Condition.Container isRoot={isRoot}>
      {node.children?.map((child, index) => {
        return (
          <React.Fragment key={`${child.name ?? 'constant'}-${index}`}>
            {index !== 0 && (
              <Condition.Item className="px-4" isRoot={isRoot}>
                {getOperatorName(node.name ?? '')}
              </Condition.Item>
            )}
            <Condition.Item isRoot={isRoot}>
              <Formula formula={child} />
            </Condition.Item>
          </React.Fragment>
        );
      })}
    </Condition.Container>
  );
}
