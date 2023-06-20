import { type OperatorNode } from '.';
import { type OperatorDeclaration } from './types';

export interface GreaterNode {
  operatorName: 'GREATER';
  children: [OperatorNode, OperatorNode];
}

export const greaterDeclaration = {
  returnType: 'boolean',
  minOperands: 2,
  maxOperands: 2,
  operandsType: 'number',
} satisfies OperatorDeclaration<GreaterNode>;
