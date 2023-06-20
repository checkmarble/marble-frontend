import { type OperatorNode } from '.';
import { type OperatorDeclaration, type OperatorDeclarationMap } from './types';

export interface BoolConstantNode {
  operatorName: 'BOOL_CONSTANT';
  constant: boolean;
}

export const boolConstantDeclaration = {
  returnType: 'boolean',
} satisfies OperatorDeclaration<BoolConstantNode>;

export interface FloatConstantNode {
  operatorName: 'FLOAT_CONSTANT';
  constant: number;
}

export const floatConstantDeclaration = {
  returnType: 'float',
} satisfies OperatorDeclaration<FloatConstantNode>;

export interface StringConstantNode {
  operatorName: 'STRING_CONSTANT';
  constant: string;
}

export const stringConstantDeclaration = {
  returnType: 'string',
} satisfies OperatorDeclaration<StringConstantNode>;

export interface StringListConstantNode {
  operatorName: 'STRING_LIST_CONSTANT';
  constant: string[];
}

export const stringListConstantDeclaration = {
  returnType: { type: 'array', items: 'string' },
} satisfies OperatorDeclaration<StringConstantNode>;

export type ConstantNodeMap = {
  STRING_CONSTANT: StringConstantNode;
  BOOL_CONSTANT: BoolConstantNode;
  FLOAT_CONSTANT: FloatConstantNode;
  STRING_LIST_CONSTANT: StringListConstantNode;
};

export type ConstantNodeName = keyof ConstantNodeMap;
export type ConstantNode = ConstantNodeMap[ConstantNodeName];

export function isConstantNode(node: OperatorNode): node is ConstantNode {
  return (
    node.operatorName === 'BOOL_CONSTANT' ||
    node.operatorName === 'FLOAT_CONSTANT' ||
    node.operatorName === 'STRING_CONSTANT' ||
    node.operatorName === 'STRING_LIST_CONSTANT'
  );
}

export const constantDeclarationsMap = {
  STRING_CONSTANT: stringConstantDeclaration,
  BOOL_CONSTANT: boolConstantDeclaration,
  FLOAT_CONSTANT: floatConstantDeclaration,
  STRING_LIST_CONSTANT: stringListConstantDeclaration,
} satisfies OperatorDeclarationMap<ConstantNodeMap>;
