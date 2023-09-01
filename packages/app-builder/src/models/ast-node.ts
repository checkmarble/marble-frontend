import { type NodeDto } from '@marble-api';
import * as R from 'remeda';

export type AstNode = {
  name: string | null;
  constant?: ConstantType;
  children: AstNode[];
  namedChildren: Record<string, AstNode>;
};

export const undefinedAstNodeName = 'Undefined';

export type ConstantType =
  | number
  | string
  | boolean
  | null
  | Array<ConstantType>
  | { [key: string]: ConstantType };

// helper
export function NewAstNode({
  name,
  constant,
  children,
  namedChildren,
}: Partial<AstNode> = {}): AstNode {
  return {
    name: name ?? null,
    constant: constant,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function NewUndefinedAstNode({
  constant,
  children,
  namedChildren,
}: Partial<Omit<AstNode, 'name'>> = {}): AstNode {
  return NewAstNode({
    name: undefinedAstNodeName,
    constant,
    children,
    namedChildren,
  });
}

export function adaptAstNode(nodeDto: NodeDto): AstNode {
  return {
    name: nodeDto.name === undefined ? null : nodeDto.name,
    constant: nodeDto.constant,
    children: (nodeDto.children ?? []).map(adaptAstNode),
    namedChildren: R.mapValues(nodeDto.named_children ?? {}, adaptAstNode),
  };
}

export function adaptNodeDto(astNode: AstNode): NodeDto {
  return {
    name: astNode.name ?? undefined,
    constant: astNode.constant,
    children: astNode.children.map(adaptNodeDto),
    named_children: R.mapValues(astNode.namedChildren ?? {}, adaptNodeDto),
  };
}

export interface UndefinedAstNode extends Omit<AstNode, 'name'> {
  name: typeof undefinedAstNodeName;
}

export function isAstNodeUnknown(node: AstNode): node is UndefinedAstNode {
  return node.name === undefinedAstNodeName;
}

export interface ConstantAstNode<T extends ConstantType = ConstantType> {
  name: null;
  constant: T;
  children: [];
  namedChildren: Record<string, never>;
}

export function NewConstantAstNode<T extends ConstantType = ConstantType>({
  constant,
}: {
  constant: T;
}): ConstantAstNode<T> {
  return {
    name: null,
    constant: constant,
    children: [],
    namedChildren: {},
  };
}

export function isConstant(node: AstNode): node is ConstantAstNode {
  return !node.name && node.constant !== undefined;
}

export interface DatabaseAccessAstNode {
  name: 'DatabaseAccess';
  constant: null;
  children: [];
  namedChildren: {
    path: ConstantAstNode<string[]>;
    fieldName: ConstantAstNode<string>;
  };
}

export const aggregationAstNodeName = 'Aggregator';
export interface AggregationAstNode {
  name: 'Aggregator';
  constant: null;
  children: [];
  namedChildren: {
    aggregator: ConstantAstNode<string>;
    tableName: ConstantAstNode<string>;
    fieldName: ConstantAstNode<string>;
    label: ConstantAstNode<string>;
    filters: AstNode;
  };
}

export function isDatabaseAccess(node: AstNode): node is DatabaseAccessAstNode {
  return node.name === 'DatabaseAccess';
}

export function isAggregation(node: AstNode): node is AggregationAstNode {
  return node.name === aggregationAstNodeName;
}

export interface OrAndGroupAstNode {
  name: 'Or';
  constant: null;
  children: {
    name: 'And';
    constant: null;
    children: AstNode[];
    namedChildren: Record<string, never>;
  }[];
  namedChildren: Record<string, never>;
}

export function isOrAndGroup(astNode: AstNode): astNode is OrAndGroupAstNode {
  if (astNode.name !== 'Or') {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== 'And') {
      return false;
    }
  }
  return true;
}

export function wrapInOrAndGroups(astNode?: AstNode): AstNode {
  if (astNode?.name === 'Or') return astNode;
  if (astNode?.name === 'And') {
    return {
      name: 'Or',
      constant: null,
      children: [astNode],
      namedChildren: {},
    };
  }
  return {
    name: 'Or',
    constant: null,
    children: [
      {
        name: 'And',
        constant: null,
        children: astNode ? [astNode] : [],
        namedChildren: {},
      },
    ],
    namedChildren: {},
  };
}
