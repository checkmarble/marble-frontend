import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode, injectIdToNode, stripIdFromNode } from './ast-node';
import { NewAndAstNode } from './builder-ast-node';
import { type ConstantAstNode, isConstant, NewConstantAstNode } from './constant';
import { type DataAccessorAstNode, isDataAccessorAstNode, isDatabaseAccess, isPayload } from './data-accessor';
import { isRecordRiskLevelCheckAstNode, NewRecordRiskLevelCheckAstNode } from './risk';

export const valueSwitchCaseAstNodeName = 'Case';

export interface ValueSwitchCaseAstNode {
  id: string;
  name: typeof valueSwitchCaseAstNodeName;
  constant?: undefined;
  children: [AstNode, ConstantAstNode<number>];
  namedChildren: Record<string, never>;
}

export const valueSwitchAstNodeName = 'Switch';

export interface ValueSwitchAstNode {
  id: string;
  name: typeof valueSwitchAstNodeName;
  constant?: undefined;
  children: ValueSwitchCaseAstNode[];
  namedChildren: {
    fallback: ConstantAstNode<number>;
  };
}

export type ValueSwitchDimensionDefinition =
  | {
      type: 'field';
      field: DataAccessorAstNode;
    }
  | {
      type: 'risk-level';
    };

export type ValueSwitchDimension =
  | (Extract<ValueSwitchDimensionDefinition, { type: 'field' }> & { values: string[] })
  | (Extract<ValueSwitchDimensionDefinition, { type: 'risk-level' }> & { values: number[] });

export type ValueSwitchModel = {
  dimensionCount: 1 | 2;
  dimensions: Array<ValueSwitchDimension | null>;
  thresholds: Record<string, number>;
  fallback: number;
};

type AtomicPredicate = {
  dimension: ValueSwitchDimensionDefinition;
  value: string | number;
};

export function NewValueSwitchAstNode(fallback = 0): ValueSwitchAstNode {
  return {
    id: uuidv7(),
    name: valueSwitchAstNodeName,
    children: [],
    namedChildren: {
      fallback: NewConstantAstNode({ constant: fallback }),
    },
  };
}

export function isValueSwitchAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<ValueSwitchAstNode, typeof node> {
  const fallback = node.namedChildren['fallback'];
  return (
    node.name === valueSwitchAstNodeName &&
    !('field' in node.namedChildren) &&
    !('type' in node.namedChildren) &&
    fallback !== undefined &&
    isConstant(fallback) &&
    typeof fallback.constant === 'number'
  );
}

export function isValueSwitchCaseAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<ValueSwitchCaseAstNode, typeof node> {
  return (
    node.name === valueSwitchCaseAstNodeName &&
    node.children.length === 2 &&
    Object.keys(node.namedChildren).length === 0 &&
    isConstant(node.children[1]!) &&
    typeof node.children[1]!.constant === 'number'
  );
}

export function createEmptyValueSwitchModel(fallback = 0): ValueSwitchModel {
  return {
    dimensionCount: 1,
    dimensions: [null],
    thresholds: {},
    fallback,
  };
}

export function getValueSwitchDimensionKey(dimension: ValueSwitchDimensionDefinition): string {
  if (dimension.type === 'risk-level') return 'risk-level';
  const field = dimension.field;
  if (isPayload(field)) return `payload:${field.children[0].constant}`;
  if (isDatabaseAccess(field)) {
    return [
      'database',
      field.namedChildren.tableName.constant,
      ...field.namedChildren.path.constant,
      field.namedChildren.fieldName.constant,
    ].join(':');
  }
  return 'unknown';
}

function getDimensionValueKey(value: string | number): string {
  return `${typeof value}:${String(value)}`;
}

export function getValueSwitchCellKey(values: Array<string | number>): string {
  return values.map(getDimensionValueKey).join('|');
}

export function getValueSwitchCombinations(model: Pick<ValueSwitchModel, 'dimensions'>): Array<Array<string | number>> {
  const dimensions = model.dimensions.filter((dimension): dimension is ValueSwitchDimension => dimension !== null);
  if (dimensions.length !== model.dimensions.length || dimensions.length === 0) return [];
  if (dimensions.length === 1) return dimensions[0]!.values.map((value) => [value]);
  return dimensions[0]!.values.flatMap((rowValue) =>
    dimensions[1]!.values.map((columnValue) => [rowValue, columnValue]),
  );
}

export function normalizeValueSwitchThresholds(model: ValueSwitchModel): ValueSwitchModel {
  const thresholds = Object.fromEntries(
    getValueSwitchCombinations(model).map((values) => {
      const key = getValueSwitchCellKey(values);
      return [key, model.thresholds[key] ?? model.fallback];
    }),
  );
  return { ...model, thresholds };
}

export function isValueSwitchModelComplete(model: ValueSwitchModel): boolean {
  if (model.dimensions.length !== model.dimensionCount || !Number.isFinite(model.fallback)) return false;
  if (model.dimensions.some((dimension) => !dimension || dimension.values.length === 0)) return false;
  const dimensions = model.dimensions.filter((dimension): dimension is ValueSwitchDimension => dimension !== null);
  if (
    dimensions.some(
      (dimension) =>
        dimension.values.some((value) => typeof value === 'string' && value.trim() === '') ||
        new Set(dimension.values.map(getDimensionValueKey)).size !== dimension.values.length,
    )
  ) {
    return false;
  }
  if (new Set(dimensions.map(getValueSwitchDimensionKey)).size !== dimensions.length) return false;
  const combinations = getValueSwitchCombinations(model);
  return (
    combinations.length > 0 &&
    combinations.every((values) => Number.isFinite(model.thresholds[getValueSwitchCellKey(values)]))
  );
}

function cloneWithNewIds<T extends AstNode>(node: T): T {
  return injectIdToNode(stripIdFromNode(node)) as T;
}

function buildAtomicPredicate(dimension: ValueSwitchDimension, value: string | number): AstNode {
  if (dimension.type === 'risk-level') {
    return NewRecordRiskLevelCheckAstNode([value as number]);
  }
  return {
    id: uuidv7(),
    name: '=',
    children: [cloneWithNewIds(dimension.field), NewConstantAstNode({ constant: value as string })],
    namedChildren: {},
  };
}

export function valueSwitchModelToAst(model: ValueSwitchModel, rootId?: string): ValueSwitchAstNode {
  const normalized = normalizeValueSwitchThresholds(model);
  const dimensions = normalized.dimensions.filter((dimension): dimension is ValueSwitchDimension => dimension !== null);
  const children = getValueSwitchCombinations(normalized).map((values): ValueSwitchCaseAstNode => {
    const predicates = values.map((value, index) => buildAtomicPredicate(dimensions[index]!, value));
    const predicate = predicates.length === 1 ? predicates[0]! : NewAndAstNode({ children: predicates });
    return {
      id: uuidv7(),
      name: valueSwitchCaseAstNodeName,
      children: [predicate, NewConstantAstNode({ constant: normalized.thresholds[getValueSwitchCellKey(values)]! })],
      namedChildren: {},
    };
  });

  return {
    id: rootId ?? uuidv7(),
    name: valueSwitchAstNodeName,
    children,
    namedChildren: {
      fallback: NewConstantAstNode({ constant: normalized.fallback }),
    },
  };
}

function parseAtomicPredicate(node: AstNode): AtomicPredicate | null {
  if (isRecordRiskLevelCheckAstNode(node)) {
    const values = node.children[0].constant;
    const value = values.length === 1 ? values[0] : undefined;
    return value === undefined ? null : { dimension: { type: 'risk-level' }, value };
  }

  if (node.name !== '=' || node.children.length !== 2) return null;
  const left = node.children[0];
  const right = node.children[1];
  if (!left || !right) return null;
  if (isDataAccessorAstNode(left) && isConstant(right) && typeof right.constant === 'string') {
    return { dimension: { type: 'field', field: left }, value: right.constant };
  }
  if (isDataAccessorAstNode(right) && isConstant(left) && typeof left.constant === 'string') {
    return { dimension: { type: 'field', field: right }, value: left.constant };
  }
  return null;
}

function parseCasePredicates(node: ValueSwitchCaseAstNode): AtomicPredicate[] | null {
  const predicate = node.children[0];
  if (predicate.name === 'And' && predicate.children.length === 2) {
    const predicates = predicate.children.map(parseAtomicPredicate);
    return predicates.every((item): item is AtomicPredicate => item !== null) ? predicates : null;
  }
  const parsed = parseAtomicPredicate(predicate);
  return parsed ? [parsed] : null;
}

export function parseValueSwitchAstNode(node: ValueSwitchAstNode): ValueSwitchModel | null {
  if (node.children.length === 0) return createEmptyValueSwitchModel(node.namedChildren.fallback.constant);
  if (!node.children.every(isValueSwitchCaseAstNode)) return null;

  const firstPredicates = parseCasePredicates(node.children[0]!);
  if (!firstPredicates || (firstPredicates.length !== 1 && firstPredicates.length !== 2)) return null;

  const dimensionKeys = firstPredicates.map((predicate) => getValueSwitchDimensionKey(predicate.dimension));
  if (new Set(dimensionKeys).size !== dimensionKeys.length) return null;

  const dimensions: ValueSwitchDimension[] = firstPredicates.map((predicate) => ({
    ...predicate.dimension,
    values: [],
  })) as ValueSwitchDimension[];
  const thresholds: Record<string, number> = {};

  for (const child of node.children) {
    const predicates = parseCasePredicates(child);
    if (!predicates || predicates.length !== dimensions.length) return null;
    if (
      predicates.some((predicate, index) => getValueSwitchDimensionKey(predicate.dimension) !== dimensionKeys[index])
    ) {
      return null;
    }

    const values = predicates.map((predicate) => predicate.value);
    const key = getValueSwitchCellKey(values);
    if (key in thresholds) return null;
    thresholds[key] = child.children[1].constant;
    predicates.forEach((predicate, index) => {
      const dimension = dimensions[index]!;
      if (!dimension.values.includes(predicate.value as never)) {
        (dimension.values as Array<string | number>).push(predicate.value);
      }
    });
  }

  const model: ValueSwitchModel = {
    dimensionCount: dimensions.length as 1 | 2,
    dimensions,
    thresholds,
    fallback: node.namedChildren.fallback.constant,
  };
  const combinations = getValueSwitchCombinations(model);
  if (combinations.length !== node.children.length) return null;
  if (combinations.some((values) => !(getValueSwitchCellKey(values) in thresholds))) return null;
  return model;
}
