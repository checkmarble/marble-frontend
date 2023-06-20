import {
  type StringConstantNode,
  type StringListConstantNode,
} from './constants';
import { type OperatorDeclaration, type PrimitiveArgType } from './types';

export interface IsInListNode<T extends 'STRING'> {
  operatorName: `${T}_IS_IN_LIST`;
  namedChildren: {
    value: T extends 'STRING' ? StringConstantNode : never;
    list: T extends 'STRING' ? StringListConstantNode : never;
  };
}

export function getIsInListDeclaration({
  valueType,
}: {
  valueType: PrimitiveArgType;
}) {
  return {
    returnType: 'boolean',
    namedArgs: {
      value: valueType,
      list: { type: 'array', items: valueType },
    },
  } satisfies OperatorDeclaration<IsInListNode<'STRING'>>;
}
