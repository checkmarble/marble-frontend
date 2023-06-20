import { type OperatorNode } from '.';
import { andDeclaration, type AndNode } from './and';
import { greaterDeclaration, type GreaterNode } from './greater';
import { getIsInListDeclaration, type IsInListNode } from './is-in-list';
import { orDeclaration, type OrNode } from './or';
import { type OperatorDeclarationMap } from './types';

export type MathOperatorNodeMap = {
  AND: AndNode;
  OR: OrNode;
  GREATER: GreaterNode;
  STRING_IS_IN_LIST: IsInListNode<'STRING'>;
};

export type MathOperatorNodeName = keyof MathOperatorNodeMap;
export type MathOperatorNode = MathOperatorNodeMap[MathOperatorNodeName];

export function isMathOperatorNode(
  operator: OperatorNode
): operator is MathOperatorNode {
  return (
    operator.operatorName === 'AND' ||
    operator.operatorName === 'OR' ||
    operator.operatorName === 'GREATER' ||
    operator.operatorName === 'STRING_IS_IN_LIST'
  );
}

export const mathOperatorDeclarationsMap = {
  AND: andDeclaration,
  OR: orDeclaration,
  GREATER: greaterDeclaration,
  STRING_IS_IN_LIST: getIsInListDeclaration({ valueType: 'string' }),
} satisfies OperatorDeclarationMap<MathOperatorNodeMap>;
