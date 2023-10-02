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
  children,
  namedChildren,
}: Partial<Omit<AstNode, 'name'>> = {}): AstNode {
  return NewAstNode({
    name: undefinedAstNodeName,
    children,
    namedChildren,
  });
}

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

export function isUndefinedAstNode(node: AstNode): node is UndefinedAstNode {
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

export const databaseAccessAstNodeName = 'DatabaseAccess';
export interface DatabaseAccessAstNode {
  name: typeof databaseAccessAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    fieldName: ConstantAstNode<string>;
    path: ConstantAstNode<string[]>;
    tableName: ConstantAstNode<string>;
  };
}

export const aggregationAstNodeName = 'Aggregator';
export interface AggregationAstNode {
  name: typeof aggregationAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    aggregator: ConstantAstNode<string>;
    tableName: ConstantAstNode<string>;
    fieldName: ConstantAstNode<string>;
    label: ConstantAstNode<string>;
    filters: AstNode;
  };
}

export function NewAggregatorAstNode(
  aggregatorName: string
): AggregationAstNode {
  return {
    name: aggregationAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      aggregator: NewConstantAstNode({ constant: aggregatorName }),
      tableName: NewConstantAstNode({ constant: '' }),
      fieldName: NewConstantAstNode({ constant: '' }),
      label: NewConstantAstNode({ constant: '' }),
      filters: NewAstNode({
        name: 'List',
        children: [],
      }),
    },
  };
}

export const payloadAstNodeName = 'Payload';
export interface PayloadAstNode {
  name: typeof payloadAstNodeName;
  constant?: undefined;
  children: [ConstantAstNode<string>];
  namedChildren: Record<string, never>;
}

export const customListAccessAstNodeName = 'CustomListAccess';
interface CustomListAccessAstNode {
  name: typeof customListAccessAstNodeName;
  constant: undefined;
  children: [];
  namedChildren: {
    customListId: ConstantAstNode<string>;
  };
}

export function NewCustomListAstNode(
  customListId: string
): CustomListAccessAstNode {
  return {
    name: customListAccessAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      customListId: NewConstantAstNode({ constant: customListId }),
    },
  };
}

export const timeAddAstNodeName = 'TimeAdd';
export interface TimeAddAstNode {
  name: typeof timeAddAstNodeName;
  constant?: undefined;
  children: [TimestampFieldAstNode, ConstantAstNode<string>];
  namedChildren: Record<string, never>;
}
export type TimestampFieldAstNode =
  | DatabaseAccessAstNode
  | PayloadAstNode
  | UndefinedAstNode;

export function NewTimeAddAstNode(
  timestampFieldAstNode: TimestampFieldAstNode = NewUndefinedAstNode() as UndefinedAstNode,
  intervalAstNode: ConstantAstNode<string> = NewConstantAstNode({
    constant: '',
  })
): TimeAddAstNode {
  return {
    name: timeAddAstNodeName,
    constant: undefined,
    children: [timestampFieldAstNode, intervalAstNode],
    namedChildren: {},
  };
}

export function isDatabaseAccess(node: AstNode): node is DatabaseAccessAstNode {
  return node.name === databaseAccessAstNodeName;
}

export function isAggregation(node: AstNode): node is AggregationAstNode {
  return node.name === aggregationAstNodeName;
}

export function isPayload(node: AstNode): node is PayloadAstNode {
  return node.name === payloadAstNodeName;
}

export function isCustomListAccess(
  node: AstNode
): node is CustomListAccessAstNode {
  return node.name === customListAccessAstNodeName;
}

export function isTimeAdd(node: AstNode): node is TimeAddAstNode {
  return node.name === timeAddAstNodeName;
}

export interface OrAndGroupAstNode {
  name: 'Or';
  constant: undefined;
  children: {
    name: 'And';
    constant: undefined;
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
