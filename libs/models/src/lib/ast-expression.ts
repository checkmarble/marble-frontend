import { type ScenarioIterationRule } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/typescript-utils';

import {
  isConstantOperator,
  isDbFieldOperator,
  isMathOperator,
  isPayloadFieldOperator,
} from './operators';

export interface AstNode {
  name: string;
  constant: ConstantOptional;
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

export const NoConstant: unique symbol = Symbol();
export type ConstantOptional = ConstantType | typeof NoConstant;

// helper
export function NewAstNode({
  name,
  constant,
  children,
  namedChildren,
}: Partial<AstNode>): AstNode {
  return {
    name: name ?? '',
    constant: constant ?? NoConstant,
    children: children ?? [],
    namedChildren: namedChildren ?? {},
  };
}

export function adaptFormulaDto(
  formula: ScenarioIterationRule['formula']
): AstNode {
  if (isConstantOperator(formula)) {
    return NewAstNode({
      name: formula.type,
      constant: formula.staticData.value,
    });
  }
  if (isDbFieldOperator(formula)) {
    return NewAstNode({
      name: formula.type,
      namedChildren: {
        triggerTableName: {
          name: 'STRING_CONSTANT',
          constant: formula.staticData.triggerTableName,
          children: [],
          namedChildren: {},
        },
        path: {
          name: 'STRING_LIST_CONSTANT',
          constant: formula.staticData.path,
          children: [],
          namedChildren: {},
        },
        fieldName: {
          name: 'STRING_CONSTANT',
          constant: formula.staticData.fieldName,
          children: [],
          namedChildren: {},
        },
      },
    });
  }
  if (isPayloadFieldOperator(formula)) {
    return NewAstNode({
      name: formula.type,
      namedChildren: {
        fieldName: {
          name: 'STRING_CONSTANT',
          constant: formula.staticData.fieldName,
          children: [],
          namedChildren: {},
        },
      },
    });
  }
  if (isMathOperator(formula) || formula.type === 'NOT') {
    return NewAstNode({
      name: formula.type,
      children: formula.children.map(adaptFormulaDto),
    });
  }
  if (formula.type === 'ROUND_FLOAT') {
    return NewAstNode({
      name: formula.type,
      children: formula.children.map(adaptFormulaDto),
      namedChildren: {
        level: {
          name: 'FLOAT_CONSTANT',
          constant: formula.staticData.level,
          children: [],
          namedChildren: {},
        },
      },
    });
  }

  assertNever('unknwon Operator:', formula);
}
