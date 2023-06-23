import { type ScenarioIterationRule } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/typescript-utils';

import { isConstantOperator } from '../constant-operator';
import {
  isDbFieldOperator,
  isPayloadFieldOperator,
} from '../data-field-operator';
import { isMathOperator } from '../math-operator';

type PrimitiveType = string | boolean | number;

export type ConstantType = PrimitiveType | Array<ConstantType> | null;

export interface AstNode {
  name: string;
  constant: ConstantType;
  children: AstNode[];
  namedChildren: Record<string, AstNode>;
}

export function getEmptyNode(): AstNode {
  return {
    name: '',
    constant: null,
    children: [],
    namedChildren: {},
  };
}

export function adaptFormulaDto(
  formula: ScenarioIterationRule['formula']
): AstNode {
  if (isConstantOperator(formula)) {
    return {
      name: formula.type,
      constant: formula.staticData.value,
      children: [],
      namedChildren: {},
    };
  }
  if (isDbFieldOperator(formula)) {
    return {
      name: formula.type,
      constant: null,
      children: [],
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
    };
  }
  if (isPayloadFieldOperator(formula)) {
    return {
      name: formula.type,
      constant: null,
      children: [],
      namedChildren: {
        fieldName: {
          name: 'STRING_CONSTANT',
          constant: formula.staticData.fieldName,
          children: [],
          namedChildren: {},
        },
      },
    };
  }
  if (isMathOperator(formula) || formula.type === 'NOT') {
    return {
      name: formula.type,
      constant: null,
      children: formula.children.map(adaptFormulaDto),
      namedChildren: {},
    };
  }
  if (formula.type === 'ROUND_FLOAT') {
    return {
      name: formula.type,
      constant: null,
      children: formula.children.map(adaptFormulaDto),
      namedChildren: {
        level: {
          name: 'FLOAT_CONSTANT',
          constant: formula.staticData.level,
          children: [],
          namedChildren: {},
        },
      },
    };
  }

  assertNever('unknwon Operator:', formula);
}

export function isOrAndGroup(astNode: AstNode): boolean {
  if (astNode.name !== 'OR') {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== 'AND') {
      return false;
    }
  }
  return true;
}

export function wrapInOrAndGroups(astNode: AstNode): AstNode {
  return {
    name: 'OR',
    constant: null,
    children: [
      {
        name: 'AND',
        constant: null,
        children: [astNode],
        namedChildren: {},
      },
    ],
    namedChildren: {},
  };
}
