import { type OperatorNode } from '.';
import { type OperatorDeclaration } from './types';

export interface OrNode {
  operatorName: 'OR';
  children: OperatorNode[];
}

export const orDeclaration = {
  returnType: 'boolean',
  minOperands: 2,
  maxOperands: Infinity,
  operandsType: 'boolean',
} satisfies OperatorDeclaration<OrNode>;
