import { type NodeDto } from 'marble-api';
import * as R from 'remeda';
import { z } from 'zod';

const baseConstantTypeSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.null(),
]);

export type ConstantType =
  | z.infer<typeof baseConstantTypeSchema>
  | Array<ConstantType>
  | { [key: string]: ConstantType };

export const constantTypeSchema: z.ZodType<ConstantType> =
  baseConstantTypeSchema.or(
    z.union([
      z.lazy(() => z.array(constantTypeSchema)),
      z.lazy(() => z.record(z.string(), constantTypeSchema)),
    ]),
  );

const baseAstNodeSchema = z.object({
  name: z.string().nullish(),
  constant: z.optional(constantTypeSchema),
});

export type AstNode = z.infer<typeof baseAstNodeSchema> & {
  children: AstNode[];
  namedChildren: Record<string, AstNode>;
};

export const astNodeSchema: z.ZodType<AstNode> = baseAstNodeSchema.extend({
  children: z.lazy(() => z.array(astNodeSchema)),
  namedChildren: z.lazy(() => z.record(z.string(), astNodeSchema)),
});

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

export const undefinedAstNodeName = 'Undefined';
export interface UndefinedAstNode extends Omit<AstNode, 'name'> {
  name: typeof undefinedAstNodeName;
}

export function NewUndefinedAstNode({
  children,
  namedChildren,
}: Partial<Omit<AstNode, 'name'>> = {}): UndefinedAstNode {
  return {
    name: undefinedAstNodeName,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function isUndefinedAstNode(node: AstNode): node is UndefinedAstNode {
  return node.name === undefinedAstNodeName;
}

// Helper functions to work with AST nodes
export function NewEmptyTriggerAstNode(): AstNode {
  return NewAstNode({
    name: 'And',
  });
}

export function NewEmptyRuleAstNode(): AstNode {
  return NewAstNode({
    name: 'Or',
    children: [],
  });
}

// DTO adapter functions
export function adaptAstNode(nodeDto: NodeDto): AstNode {
  return {
    name: nodeDto.name,
    constant: nodeDto.constant,
    children: (nodeDto.children ?? []).map(adaptAstNode),
    namedChildren: R.mapValues(nodeDto.named_children ?? {}, adaptAstNode),
  };
}

export function adaptNodeDto(astNode: AstNode): NodeDto {
  return {
    name: astNode.name ?? undefined,
    constant: astNode.constant,
    children: (astNode.children ?? []).map(adaptNodeDto),
    named_children: R.mapValues(astNode.namedChildren ?? {}, adaptNodeDto),
  };
}
