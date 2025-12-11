import { type NodeDto } from 'marble-api';
import * as R from 'remeda';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod/v4';

import { type AndAstNode, NewAndAstNode, NewOrWithAndAstNode, type OrWithAndAstNode } from './builder-ast-node';

const baseConstantTypeSchema = z.union([z.number(), z.string(), z.boolean(), z.null()]);

export type ConstantType =
  | z.infer<typeof baseConstantTypeSchema>
  | Array<ConstantType>
  | { [key: string]: ConstantType };

export const constantTypeSchema: z.ZodType<ConstantType, ConstantType> = baseConstantTypeSchema.or(
  z.union([z.lazy(() => z.array(constantTypeSchema)), z.lazy(() => z.record(z.string(), constantTypeSchema))]),
);

const baseAstNodeSchema = z.object({
  id: z.uuid(),
  name: z.string().nullish(),
  constant: z.optional(constantTypeSchema),
});

export type AstNode = z.infer<typeof baseAstNodeSchema> & {
  children: AstNode[];
  namedChildren: Record<string, AstNode>;
};

export type IdLessAstNodeArray<Arr extends AstNode[]> = Arr extends []
  ? []
  : Arr extends [infer N extends AstNode, ...infer R extends AstNode[]]
    ? [IdLessAstNode<N>, ...IdLessAstNodeArray<R>]
    : Arr extends (infer N extends AstNode)[]
      ? IdLessAstNode<N>[]
      : never;
export type IdLessAstNode<Node extends AstNode = AstNode> = Node extends infer N extends AstNode
  ? Omit<N, 'id' | 'children' | 'namedChildren'> & {
      children: IdLessAstNodeArray<N['children']>;
      namedChildren: {
        [k in keyof Node['namedChildren']]: IdLessAstNode<N['namedChildren'][k]>;
      };
    }
  : never;

export type CheckNodeId<T extends AstNode, N> = N extends AstNode
  ? T
  : N extends IdLessAstNode
    ? IdLessAstNode<T>
    : never;

export const astNodeSchema: z.ZodType<AstNode, AstNode> = baseAstNodeSchema.extend({
  children: z.lazy(() => z.array(astNodeSchema)),
  namedChildren: z.lazy(() => z.record(z.string(), astNodeSchema)),
});

export function NewAstNode({ name, constant, children, namedChildren }: Partial<AstNode> = {}): AstNode {
  return {
    id: uuidv7(),
    name: name ?? null,
    constant: constant,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function injectIdToNode<T extends IdLessAstNode>(node: T): T extends IdLessAstNode<infer N> ? N : never {
  return {
    ...node,
    id: uuidv7(),
    children: R.map(node.children, (child) => injectIdToNode(child)),
    namedChildren: R.mapValues(node.namedChildren, (child) => injectIdToNode(child)),
  } as unknown as ReturnType<typeof injectIdToNode<T>>;
}

export function stripIdFromNode<T extends AstNode>(
  node: T,
): T extends infer N extends AstNode ? IdLessAstNode<N> : never {
  const { id: _, ...strippedNode } = node;
  return {
    ...strippedNode,
    children: R.map(node.children, (child) => stripIdFromNode(child)),
    namedChildren: R.mapValues(node.namedChildren, (child) => stripIdFromNode(child)),
  } as unknown as ReturnType<typeof stripIdFromNode<T>>;
}

export const undefinedAstNodeName = 'Undefined';
export interface UndefinedAstNode extends Omit<AstNode, 'name'> {
  name: typeof undefinedAstNodeName;
}

export function NewUndefinedAstNode({
  children,
  namedChildren,
}: Partial<Omit<AstNode, 'name'>> = {}): UndefinedAstNode {
  return {
    id: uuidv7(),
    name: undefinedAstNodeName,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function isUndefinedAstNode(node: IdLessAstNode | AstNode): node is CheckNodeId<UndefinedAstNode, typeof node> {
  return node.name === undefinedAstNodeName;
}

// Helper functions to work with AST nodes
export function NewEmptyTriggerAstNode(): AndAstNode {
  return NewAndAstNode();
}

export function NewEmptyRuleAstNode(): OrWithAndAstNode {
  return NewOrWithAndAstNode();
}

// DTO adapter functions
export function adaptAstNode(nodeDto: NodeDto): AstNode {
  return {
    id: nodeDto.id ?? uuidv7(),
    name: nodeDto.name,
    constant: nodeDto.constant,
    children: (nodeDto.children ?? []).map(adaptAstNode),
    namedChildren: R.mapValues(nodeDto.named_children ?? {}, adaptAstNode),
  };
}

export function adaptNodeDto(astNode: AstNode): NodeDto {
  return {
    id: astNode.id,
    name: astNode.name ?? undefined,
    constant: astNode.constant,
    children: (astNode.children ?? []).map(adaptNodeDto),
    named_children: R.mapValues(astNode.namedChildren ?? {}, adaptNodeDto),
  };
}
