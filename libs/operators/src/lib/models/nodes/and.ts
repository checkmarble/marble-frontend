import { type OperatorNode } from '..';
import { type OperatorDeclaration } from './types';

export interface AndNode {
  operatorName: 'AND';
  children: OperatorNode[];
}

export const andDeclaration = {
  returnType: 'boolean',
  minOperands: 2,
  maxOperands: Infinity,
  operandsType: 'boolean',
} satisfies OperatorDeclaration<AndNode>;
