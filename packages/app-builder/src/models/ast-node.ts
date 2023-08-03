import { type NodeDto } from '@marble-api';
import * as R from 'remeda';

export interface AstNode {
  name: string | null;
  constant?: ConstantType;
  children: AstNode[];
  namedChildren: Record<string, AstNode>;
}

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

export function adaptNodeDto(nodeDto: NodeDto): AstNode {
  return {
    name: nodeDto.name === undefined ? null : nodeDto.name,
    constant: nodeDto.constant,
    children: (nodeDto.children ?? []).map(adaptNodeDto),
    namedChildren: R.mapValues(nodeDto.named_children ?? {}, adaptNodeDto),
  };
}

export function adaptAstNode(astNode: AstNode): NodeDto {
  return {
    name: astNode.name ?? undefined,
    constant: astNode.constant,
    children: astNode.children.map(adaptAstNode),
    named_children: R.mapValues(astNode.namedChildren ?? {}, adaptAstNode),
  };
}

export function isAstNodeEmpty(node: AstNode): boolean {
  return (
    !node.name &&
    node.constant === undefined &&
    node.children.length === 0 &&
    Object.keys(node.namedChildren).length === 0
  );
}

export interface ConstantAstNode<T extends ConstantType = ConstantType> {
  name: null;
  constant: T;
  children: [];
  namedChildren: Record<string, never>;
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

export function isDatabaseAccess(node: AstNode): node is DatabaseAccessAstNode {
  return node.name === 'DatabaseAccess';
}

export function isOrAndGroup(astNode: AstNode): boolean {
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
