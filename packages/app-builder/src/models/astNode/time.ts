import { v7 as uuidv7 } from 'uuid';

import { type timeAddOperators } from '../modale-operators';
import {
  type AstNode,
  type CheckNodeId,
  type IdLessAstNode,
  isUndefinedAstNode,
  NewUndefinedAstNode,
  type UndefinedAstNode,
} from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';
import { type DataAccessorAstNode, isDataAccessorAstNode } from './data-accessor';

export const timeAddAstNodeName = 'TimeAdd';
export interface TimeAddAstNode {
  id: string;
  name: typeof timeAddAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    timestampField: TimestampFieldAstNode;
    sign: ConstantAstNode<(typeof timeAddOperators)[number] | null>;
    duration: ConstantAstNode<string>;
  };
}

export function NewTimeAddAstNode(
  timestampFieldAstNode: TimestampFieldAstNode = NewUndefinedAstNode(),
  signAstNode: TimeAddAstNode['namedChildren']['sign'] = NewConstantAstNode({
    constant: null,
  }),
  durationAstNode: ConstantAstNode<string> = NewConstantAstNode({
    constant: '',
  }),
): TimeAddAstNode {
  return {
    id: uuidv7(),
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
  id: string;
  name: typeof timeNowAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: Record<string, never>;
}

export function NewTimeNowAstNode(): TimeNowAstNode {
  return {
    id: uuidv7(),
    name: timeNowAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {},
  };
}

export type TimestampFieldAstNode = DataAccessorAstNode | TimeNowAstNode | TimeAddAstNode | UndefinedAstNode;

export function isTimestampFieldAstNode(node: AstNode): node is TimestampFieldAstNode {
  return isDataAccessorAstNode(node) || isTimeNow(node) || isTimeAdd(node) || isUndefinedAstNode(node);
}

export function isTimeAdd(node: IdLessAstNode | AstNode): node is CheckNodeId<TimeAddAstNode, typeof node> {
  return node.name === timeAddAstNodeName;
}

export function isTimestampExtract(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<TimestampExtractAstNode, typeof node> {
  return node.name === timestampExtractAstNodeName;
}

export function isTimeNow(node: IdLessAstNode | AstNode): node is CheckNodeId<TimeNowAstNode, typeof node> {
  return node.name === timeNowAstNodeName;
}

export const timestampExtractAstNodeName = 'TimestampExtract';
export const validTimestampExtractParts = ['year', 'month', 'day_of_month', 'day_of_week', 'hour'] as const;
export type ValidTimestampExtractParts = (typeof validTimestampExtractParts)[number];

export interface TimestampExtractAstNode {
  id: string;
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
    id: uuidv7(),
    name: timestampExtractAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      timestamp: timestampFieldAstNode,
      part,
    },
  };
}
