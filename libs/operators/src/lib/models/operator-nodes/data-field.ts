import { type OperatorNode } from '.';
import {
  type StringConstantNode,
  type StringListConstantNode,
} from './constants';
import {
  type ArgType,
  type OperatorDeclaration,
  type OperatorDeclarationMap,
} from './types';

type DataFieldType = 'BOOL' | 'FLOAT' | 'STRING';

export interface DbFieldNode<T extends DataFieldType> {
  operatorName: `DB_FIELD_${T}`;
  namedChildren: {
    triggerTableName: StringConstantNode;
    path: StringListConstantNode;
    fieldName: StringConstantNode;
  };
}

export function getDbFieldDeclaration({ returnType }: { returnType: ArgType }) {
  return {
    returnType,
    namedArgs: {
      triggerTableName: 'string',
      path: { type: 'array', items: 'string' },
      fieldName: 'string',
    },
  } satisfies OperatorDeclaration<DbFieldNode<'BOOL'>>;
}

export type AnyDbFieldNodeMap = {
  DB_FIELD_BOOL: DbFieldNode<'BOOL'>;
  DB_FIELD_FLOAT: DbFieldNode<'FLOAT'>;
  DB_FIELD_STRING: DbFieldNode<'STRING'>;
};

export type AnyDbFieldNodeName = keyof AnyDbFieldNodeMap;
export type AnyDbFieldNode = AnyDbFieldNodeMap[AnyDbFieldNodeName];

export function isDbFieldNode(node: OperatorNode): node is AnyDbFieldNode {
  return node.operatorName.startsWith('DB_FIELD_');
}

export const anyDbFieldDeclarationsMap = {
  DB_FIELD_BOOL: getDbFieldDeclaration({ returnType: 'boolean' }),
  DB_FIELD_FLOAT: getDbFieldDeclaration({ returnType: 'float' }),
  DB_FIELD_STRING: getDbFieldDeclaration({ returnType: 'string' }),
} satisfies OperatorDeclarationMap<AnyDbFieldNodeMap>;

export interface PayloadFieldNode<T extends DataFieldType> {
  operatorName: `PAYLOAD_FIELD_${T}`;
  namedChildren: {
    fieldName: StringConstantNode;
  };
}

export function getPayloadFieldDeclaration({
  returnType,
}: {
  returnType: ArgType;
}) {
  return {
    returnType,
    namedArgs: {
      fieldName: 'string',
    },
  } satisfies OperatorDeclaration<PayloadFieldNode<'BOOL'>>;
}

export type AnyPayloadFieldNodeMap = {
  PAYLOAD_FIELD_BOOL: PayloadFieldNode<'BOOL'>;
  PAYLOAD_FIELD_FLOAT: PayloadFieldNode<'FLOAT'>;
  PAYLOAD_FIELD_STRING: PayloadFieldNode<'STRING'>;
};

export type AnyPayloadFieldNodeName = keyof AnyPayloadFieldNodeMap;
export type AnyPayloadFieldNode =
  AnyPayloadFieldNodeMap[AnyPayloadFieldNodeName];

export function isPayloadFieldNode(
  node: OperatorNode
): node is AnyPayloadFieldNode {
  return node.operatorName.startsWith('PAYLOAD_FIELD_');
}

export const anyPayloadFieldDeclarationsMap = {
  PAYLOAD_FIELD_BOOL: getPayloadFieldDeclaration({ returnType: 'boolean' }),
  PAYLOAD_FIELD_FLOAT: getPayloadFieldDeclaration({ returnType: 'float' }),
  PAYLOAD_FIELD_STRING: getPayloadFieldDeclaration({ returnType: 'string' }),
} satisfies OperatorDeclarationMap<AnyPayloadFieldNodeMap>;

export type DataFieldNodeMap = AnyDbFieldNodeMap & AnyPayloadFieldNodeMap;

export type DataFieldNodeName = keyof DataFieldNodeMap;
export type DataFieldNode = DataFieldNodeMap[DataFieldNodeName];

export function isDataFieldNode(node: OperatorNode): node is DataFieldNode {
  return isDbFieldNode(node) || isPayloadFieldNode(node);
}

export const dataFieldDeclarationsMap = {
  ...anyPayloadFieldDeclarationsMap,
  ...anyDbFieldDeclarationsMap,
} satisfies OperatorDeclarationMap<DataFieldNodeMap>;
