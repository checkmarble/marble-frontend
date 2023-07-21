import { type NodeDto, type ScenarioIterationRule } from '@marble-api';
import { assertNever } from '@typescript-utils';
import * as R from 'remeda';

import {
  isConstantOperator,
  isDbFieldOperator,
  isMathOperator,
  isPayloadFieldOperator,
} from './operators';

export interface AstNode {
  name: string | null;
  constant: ConstantType | null;
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
    constant: constant ?? null,
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

export function adaptNodeDto(nodeDto: NodeDto): AstNode {
  return NewAstNode({
    name: nodeDto.name,
    constant: nodeDto.constant,
    children: nodeDto.children?.map(adaptNodeDto),
    namedChildren: R.mapValues(nodeDto.named_children ?? {}, adaptNodeDto),
  });
}

export function adaptAstNode(astNode: AstNode): NodeDto {
  return {
    name: astNode.name ?? undefined,
    constant: astNode.constant ?? undefined,
    children: astNode.children?.map(adaptAstNode),
    named_children: R.mapValues(astNode.namedChildren ?? {}, adaptAstNode),
  };
}

export function isAstNodeEmpty(node: AstNode): boolean {
  return (
    !node.name &&
    !node.constant &&
    node.children?.length === 0 &&
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
  return !node.name && !!node.constant;
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
