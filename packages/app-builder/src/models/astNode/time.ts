import {
  type AstNode,
  isUndefinedAstNode,
  NewUndefinedAstNode,
  type UndefinedAstNode,
} from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';
import { type DataAccessorAstNode, isDataAccessorAstNode } from './data-accessor';

export const timeAddAstNodeName = 'TimeAdd';
export interface TimeAddAstNode {
  name: typeof timeAddAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    timestampField: TimestampFieldAstNode;
    sign: ConstantAstNode<string>;
    duration: ConstantAstNode<string>;
  };
}

export function NewTimeAddAstNode(
  timestampFieldAstNode: TimestampFieldAstNode = NewUndefinedAstNode(),
  signAstNode: ConstantAstNode<string> = NewConstantAstNode({
    constant: '',
  }),
  durationAstNode: ConstantAstNode<string> = NewConstantAstNode({
    constant: '',
  }),
): TimeAddAstNode {
  return {
    name: timeAddAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      timestampField: timestampFieldAstNode,
      sign: signAstNode,
      duration: durationAstNode,
    },
  };
}

export const timeNowAstNodeName = 'TimeNow';
export interface TimeNowAstNode {
  name: typeof timeNowAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: Record<string, never>;
}

export function NewTimeNowAstNode(): TimeNowAstNode {
  return {
    name: timeNowAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {},
  };
}

export type TimestampFieldAstNode =
  | DataAccessorAstNode
  | TimeNowAstNode
  | TimeAddAstNode
  | UndefinedAstNode;

export function isTimestampFieldAstNode(node: AstNode): node is TimestampFieldAstNode {
  return (
    isDataAccessorAstNode(node) || isTimeNow(node) || isTimeAdd(node) || isUndefinedAstNode(node)
  );
}

export function isTimeAdd(node: AstNode): node is TimeAddAstNode {
  return node.name === timeAddAstNodeName;
}

export function isTimestampExtract(node: AstNode): node is TimestampExtractAstNode {
  return node.name === timestampExtractAstNodeName;
}

export function isTimeNow(node: AstNode): node is TimeNowAstNode {
  return node.name === timeNowAstNodeName;
}

export const timestampExtractAstNodeName = 'TimestampExtract';
export const validTimestampExtractParts = [
  'year',
  'month',
  'day_of_month',
  'day_of_week',
  'hour',
] as const;
export type ValidTimestampExtractParts = (typeof validTimestampExtractParts)[number];

export interface TimestampExtractAstNode {
  name: typeof timestampExtractAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    timestamp: TimestampFieldAstNode;
    part: ConstantAstNode<ValidTimestampExtractParts>;
  };
}
export function NewTimestampExtractAstNode(
  timestampFieldAstNode: TimestampFieldAstNode = NewUndefinedAstNode(),
  part: ConstantAstNode<ValidTimestampExtractParts> = NewConstantAstNode({
    constant: 'hour',
  }),
): TimestampExtractAstNode {
  return {
    name: timestampExtractAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      timestamp: timestampFieldAstNode,
      part,
    },
  };
}
