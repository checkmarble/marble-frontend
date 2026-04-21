import { match } from 'ts-pattern';
import { v7 as uuidv7 } from 'uuid';
import { type AstNode, type DataModel } from '..';
import { type AggregationAstNode, isAggregation } from '../astNode/aggregation';
import { NewUndefinedAstNode } from '../astNode/ast-node';
import { isMainAstBinaryNode } from '../astNode/builder-ast-node';
import { isConstant, NewConstantAstNode } from '../astNode/constant';
import {
  isScoreComputationAstNode,
  type ScoreComputationAstNode,
  type SwitchAstNode,
  scoreComputationAstNodeName,
  switchAstNodeName,
} from '../astNode/control-flow';
import { isCustomListAccess, NewCustomListAstNode } from '../astNode/custom-list';
import { isPayload, type PayloadAstNode } from '../astNode/data-accessor';
import {
  isMonitoringListCheckAstNode,
  monitoringListCheckAstNodeName,
  NewTagCheckAstNode,
} from '../astNode/monitoring-list-check';
import { isRecordHasPastAlertAstNode, NewRecordHasPastAlertsAstNode } from '../astNode/risk';
import {
  type BoolSwitch,
  getOperationType,
  type NumberSwitch,
  type ScoreImpact,
  type StringListOp,
  type StringOperation,
  type StringSingleValueOp,
  type StringSwitch,
  type TagsSwitch,
} from './conditions';
import { type DraftRuleModel, type RuleModel } from './rule-model';

export function transformSwitchAstNodeToModel(
  node: SwitchAstNode,
  entityType?: string,
  dataModel?: DataModel,
): DraftRuleModel | null {
  if (!isConstant(node.namedChildren.type)) return null;
  const type = node.namedChildren.type.constant;
  if (
    type !== 'user_attribute' &&
    type !== 'aggregate' &&
    type !== 'screening_tags' &&
    type !== 'entity_tags' &&
    type !== 'past_alerts'
  )
    return null;

  if (type === 'past_alerts') {
    const scoreComputationNodes = node.children.filter(isScoreComputationAstNode) as ScoreComputationAstNode[];
    if (scoreComputationNodes.length === 0) {
      return { type: 'past_alerts', conditions: { type: 'bool', ifTrue: { modifier: 0 }, ifFalse: { modifier: 0 } } };
    }
    const conditions = parsePastAlertsBranches(scoreComputationNodes);
    if (!conditions) return null;
    return { type: 'past_alerts', conditions };
  }

  if (type === 'screening_tags' || type === 'entity_tags') {
    const scoreComputationNodes = node.children.filter(isScoreComputationAstNode) as ScoreComputationAstNode[];
    if (scoreComputationNodes.length === 0) {
      return {
        type,
        conditions: { type: 'tags', branches: [], default: { modifier: 0 } },
      };
    }
    const conditions = parseTagsBranches(scoreComputationNodes);
    if (!conditions) return null;
    return { type, conditions };
  }

  const scoreComputationNodes = node.children.filter(isScoreComputationAstNode) as ScoreComputationAstNode[];

  // Empty node (new rule) → return the null-field draft variant
  if (scoreComputationNodes.length === 0) return { type, field: null, conditions: null };

  const fieldType = entityType && dataModel ? getOperationType(entityType, dataModel, node) : null;

  const conditions = match(fieldType)
    .with('Bool', () => parseBoolBranches(scoreComputationNodes))
    .with('String', () => parseStringBranches(scoreComputationNodes))
    .with('Int', 'Float', () => parseNumberBranches(scoreComputationNodes))
    .otherwise(() => null);
  if (!conditions) return null;

  if (type === 'user_attribute') {
    if (!isPayload(node.namedChildren.field)) return null;
    return { type: 'user_attribute', field: node.namedChildren.field as PayloadAstNode, conditions };
  }

  if (type === 'aggregate') {
    if (!isAggregation(node.namedChildren.field)) return null;
    return { type: 'aggregate', field: node.namedChildren.field as AggregationAstNode, conditions };
  }

  return null;
}

export function buildSwitchAstNodeFromModel(model: RuleModel): SwitchAstNode {
  if (model.type === 'screening_tags' || model.type === 'entity_tags') {
    return {
      id: uuidv7(),
      name: switchAstNodeName,
      constant: undefined,
      namedChildren: {
        field: NewUndefinedAstNode(),
        type: NewConstantAstNode({ constant: model.type }),
      },
      children: buildTagsSwitchChildren(model.conditions),
    };
  }
  if (model.type === 'past_alerts') {
    return {
      id: uuidv7(),
      name: switchAstNodeName,
      constant: undefined,
      namedChildren: {
        field: NewUndefinedAstNode(),
        type: NewConstantAstNode({ constant: model.type }),
      },
      children: buildPastAlertsSwitchChildren(model.conditions),
    };
  }
  const children = buildConditionChildren(model.field, model.conditions);
  return {
    id: uuidv7(),
    name: switchAstNodeName,
    constant: undefined,
    namedChildren: {
      field: model.field,
      type: NewConstantAstNode({ constant: model.type }),
    },
    children,
  };
}

function buildTagsSwitchChildren(conditions: TagsSwitch): AstNode[] {
  const branchNodes = conditions.branches.map((branch) => {
    const branchCondition = NewTagCheckAstNode(monitoringListCheckAstNodeName, {
      topicFilters: branch.value,
    });
    return buildScoreComputationAstNode(branchCondition, branch.impact);
  });
  return [...branchNodes, buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.default)];
}

function buildPastAlertsSwitchChildren(conditions: BoolSwitch): AstNode[] {
  return [
    buildScoreComputationAstNode(NewRecordHasPastAlertsAstNode(), conditions.ifTrue),
    buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.ifFalse),
  ];
}

function parsePastAlertsBranches(nodes: ScoreComputationAstNode[]): BoolSwitch | null {
  if (nodes.length !== 2) return null;
  const [trueNode, falseNode] = nodes as [ScoreComputationAstNode, ScoreComputationAstNode];

  const trueCondition = trueNode.children[0];
  if (!trueCondition || !isRecordHasPastAlertAstNode(trueCondition)) return null;

  const falseCondition = falseNode.children[0];
  if (!falseCondition || !isConstant(falseCondition) || falseCondition.constant !== true) return null;

  const ifTrue: ScoreImpact = { modifier: trueNode.namedChildren.modifier.constant };
  if (trueNode.namedChildren.floor) ifTrue.floor = trueNode.namedChildren.floor.constant;

  const ifFalse: ScoreImpact = { modifier: falseNode.namedChildren.modifier.constant };
  if (falseNode.namedChildren.floor) ifFalse.floor = falseNode.namedChildren.floor.constant;

  return { type: 'bool', ifTrue, ifFalse };
}

function parseTagsBranches(nodes: ScoreComputationAstNode[]): TagsSwitch | null {
  const lastNode = nodes[nodes.length - 1]!;
  const lastCondition = lastNode.children[0];
  if (!lastCondition || !isConstant(lastCondition) || lastCondition.constant !== true) return null;

  const defaultImpact: ScoreImpact = { modifier: lastNode.namedChildren.modifier.constant };
  if (lastNode.namedChildren.floor) defaultImpact.floor = lastNode.namedChildren.floor.constant;

  const branches = nodes.slice(0, -1).map((branchNode) => {
    const branchImpact: ScoreImpact = { modifier: branchNode.namedChildren.modifier.constant };
    if (branchNode.namedChildren.floor) branchImpact.floor = branchNode.namedChildren.floor.constant;

    const conditionNode = branchNode.children[0];
    let tagValues: string[] = [];
    if (conditionNode && isMonitoringListCheckAstNode(conditionNode)) {
      tagValues = conditionNode.namedChildren.config.constant.topicFilters;
    }
    return { value: tagValues, impact: branchImpact };
  });

  return { type: 'tags', branches, default: defaultImpact };
}

function buildConditionChildren(field: AstNode, conditions: NumberSwitch | StringSwitch | BoolSwitch): AstNode[] {
  switch (conditions.type) {
    case 'number':
      return buildNumberSwitchChildren(field, conditions);
    case 'bool':
      return buildBoolSwitchChildren(field, conditions);
    case 'string':
      return buildStringSwitchChildren(field, conditions);
  }
}

function buildNumberSwitchChildren(field: AstNode, conditions: NumberSwitch): AstNode[] {
  return [
    ...conditions.branches.map((branch) =>
      buildScoreComputationAstNode(buildLessThanOrEqualNode(field, branch.value), branch.impact),
    ),
    buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.default),
  ];
}

function buildLessThanOrEqualNode(field: AstNode, threshold: number): AstNode {
  return {
    id: uuidv7(),
    name: '<=',
    constant: undefined,
    children: [{ ...field, id: uuidv7() }, NewConstantAstNode({ constant: threshold })],
    namedChildren: {},
  };
}

function buildBoolSwitchChildren(field: AstNode, conditions: BoolSwitch): AstNode[] {
  return [
    buildScoreComputationAstNode(buildEqualNode(field, true), conditions.ifTrue),
    buildScoreComputationAstNode(buildEqualNode(field, false), conditions.ifFalse),
  ];
}

function buildEqualNode(field: AstNode, value: boolean): AstNode {
  return {
    id: uuidv7(),
    name: '=',
    constant: undefined,
    children: [{ ...field, id: uuidv7() }, NewConstantAstNode({ constant: value })],
    namedChildren: {},
  };
}

function buildStringSwitchChildren(field: AstNode, conditions: StringSwitch): AstNode[] {
  return [
    ...conditions.branches.map((branch) =>
      buildScoreComputationAstNode(buildStringOperatorNode(field, branch.value), branch.impact),
    ),
    buildScoreComputationAstNode(NewConstantAstNode({ constant: true }), conditions.default),
  ];
}

function buildStringOperatorNode(field: AstNode, operation: StringOperation): AstNode {
  const lhs = { ...field, id: uuidv7() };
  if (operation.op === 'IsInList' || operation.op === 'IsNotInList') {
    const rhs =
      operation.value.type === 'customList'
        ? NewCustomListAstNode(operation.value.listId)
        : NewConstantAstNode({ constant: operation.value.values });
    return { id: uuidv7(), name: operation.op, constant: undefined, children: [lhs, rhs], namedChildren: {} };
  }
  return {
    id: uuidv7(),
    name: operation.op,
    constant: undefined,
    children: [lhs, NewConstantAstNode({ constant: operation.value })],
    namedChildren: {},
  };
}

const stringOps = new Set<string>([
  '=',
  '≠',
  'StringContains',
  'StringNotContain',
  'StringStartsWith',
  'StringEndsWith',
  'IsInList',
  'IsNotInList',
]);

function parseStringBranches(nodes: ScoreComputationAstNode[]): StringSwitch | null {
  if (nodes.length === 0) return null;
  const lastNode = nodes[nodes.length - 1]!;
  const lastCondition = lastNode.children[0];
  if (!lastCondition || !isConstant(lastCondition) || lastCondition.constant !== true) return null;

  const nonDefaultNodes = nodes.slice(0, -1);
  const branches: StringSwitch['branches'] = [];
  for (const n of nonDefaultNodes) {
    const condition = n.children[0];
    if (!condition || !isMainAstBinaryNode(condition) || !stringOps.has(condition.name)) return null;
    const rhs = condition.children[1];
    const impact: ScoreImpact = { modifier: n.namedChildren.modifier.constant };
    if (n.namedChildren.floor) impact.floor = n.namedChildren.floor.constant;
    const isListOp = condition.name === 'IsInList' || condition.name === 'IsNotInList';
    if (isListOp) {
      if (isCustomListAccess(rhs)) {
        branches.push({
          value: {
            op: condition.name as StringListOp,
            value: { type: 'customList', listId: rhs.namedChildren.customListId.constant },
          },
          impact,
        });
      } else if (isConstant(rhs) && Array.isArray(rhs.constant) && rhs.constant.every((s) => typeof s === 'string')) {
        branches.push({
          value: {
            op: condition.name as StringListOp,
            value: { type: 'stringList', values: rhs.constant as string[] },
          },
          impact,
        });
      } else {
        return null;
      }
    } else {
      if (!isConstant(rhs) || typeof rhs.constant !== 'string') return null;
      branches.push({ value: { op: condition.name as StringSingleValueOp, value: rhs.constant }, impact });
    }
  }

  const defaultImpact: ScoreImpact = { modifier: lastNode.namedChildren.modifier.constant };
  if (lastNode.namedChildren.floor) defaultImpact.floor = lastNode.namedChildren.floor.constant;
  return { type: 'string', branches, default: defaultImpact };
}

function parseNumberBranchValues(nodes: ScoreComputationAstNode[]): NumberSwitch['branches'] | null {
  const branches: NumberSwitch['branches'] = [];
  for (const n of nodes) {
    const condition = n.children[0];
    if (!condition || !isMainAstBinaryNode(condition) || condition.name !== '<=') return null;
    const valueNode = condition.children[1];
    if (!isConstant(valueNode) || typeof valueNode.constant !== 'number') return null;
    const impact: ScoreImpact = { modifier: n.namedChildren.modifier.constant };
    if (n.namedChildren.floor) impact.floor = n.namedChildren.floor.constant;
    branches.push({ value: valueNode.constant, impact });
  }
  return branches;
}

function parseNumberBranches(nodes: ScoreComputationAstNode[]): NumberSwitch | null {
  if (nodes.length === 0) return null;
  const lastNode = nodes[nodes.length - 1]!;
  const lastCondition = lastNode.children[0];
  if (!lastCondition || !isConstant(lastCondition) || lastCondition.constant !== true) return null;
  const nonDefaultNodes = nodes.slice(0, -1);
  const branches = parseNumberBranchValues(nonDefaultNodes);
  if (!branches) return null;
  const defaultImpact: ScoreImpact = { modifier: lastNode.namedChildren.modifier.constant };
  if (lastNode.namedChildren.floor) defaultImpact.floor = lastNode.namedChildren.floor.constant;
  return { type: 'number', branches, default: defaultImpact };
}

function parseBoolBranches(nodes: ScoreComputationAstNode[]): BoolSwitch | null {
  if (nodes.length !== 2) return null;
  const [trueNode, falseNode] = nodes as [ScoreComputationAstNode, ScoreComputationAstNode];

  const trueCondition = trueNode.children[0];
  const falseCondition = falseNode.children[0];
  if (
    !trueCondition ||
    !isMainAstBinaryNode(trueCondition) ||
    trueCondition.name !== '=' ||
    !falseCondition ||
    !isMainAstBinaryNode(falseCondition) ||
    falseCondition.name !== '='
  )
    return null;

  const trueRhs = trueCondition.children[1];
  const falseRhs = falseCondition.children[1];
  if (!isConstant(trueRhs) || trueRhs.constant !== true) return null;
  if (!isConstant(falseRhs) || falseRhs.constant !== false) return null;

  const ifTrue: ScoreImpact = { modifier: trueNode.namedChildren.modifier.constant };
  if (trueNode.namedChildren.floor) ifTrue.floor = trueNode.namedChildren.floor.constant;

  const ifFalse: ScoreImpact = { modifier: falseNode.namedChildren.modifier.constant };
  if (falseNode.namedChildren.floor) ifFalse.floor = falseNode.namedChildren.floor.constant;

  return { type: 'bool', ifTrue, ifFalse };
}

function buildScoreComputationAstNode(conditionNode: AstNode, impact: ScoreImpact): ScoreComputationAstNode {
  const namedChildren: ScoreComputationAstNode['namedChildren'] = {
    modifier: NewConstantAstNode({ constant: impact.modifier }),
  };
  if (impact.floor !== undefined) {
    namedChildren.floor = NewConstantAstNode({ constant: impact.floor });
  }
  return {
    id: uuidv7(),
    name: scoreComputationAstNodeName,
    constant: undefined,
    children: [conditionNode],
    namedChildren,
  };
}
