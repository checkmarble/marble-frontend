import {
  ScoringRuleset as ScoringRulesetDto,
  ScoringRulesetWithRules as ScoringRulesetWithRulesDto,
  ScoringSettings as ScoringSettingsDto,
} from 'marble-api';
import { v7 as uuidv7 } from 'uuid';
import { AstNode, adaptAstNode, DataModel } from '.';
import { AggregationAstNode, isAggregation } from './astNode/aggregation';
import { isMainAstBinaryNode } from './astNode/builder-ast-node';
import { isConstant, NewConstantAstNode } from './astNode/constant';
import {
  isScoreComputationAstNode,
  ScoreComputationAstNode,
  SwitchAstNode,
  scoreComputationAstNodeName,
  switchAstNodeName,
} from './astNode/control-flow';
import { isPayload, PayloadAstNode } from './astNode/data-accessor';

export type ScoringRule = {
  stableId: string;
  name: string;
  description: string;
  ast: AstNode;
};

export const adaptScoringRule = (dto: ScoringRulesetWithRulesDto['rules'][number]): ScoringRule => ({
  stableId: dto.stable_id,
  name: dto.name,
  description: dto.description ?? '',
  ast: adaptAstNode(dto.ast),
});

export type ScoringSettings = {
  maxRiskLevel: number;
  createdAt: string;
  updatedAt: string;
};

export const adaptScoringSettings = (dto: ScoringSettingsDto): ScoringSettings => {
  return {
    maxRiskLevel: dto.max_risk_level,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

export type ScoringRuleset = {
  id: string;
  orgId: string;
  version: number;
  status: 'draft' | 'committed';
  name: string;
  description: string;
  recordType: string;
  thresholds: number[];
  cooldownSeconds: number;
  createdAt: string;
};

export type ScoringRulesetWithRules = ScoringRuleset & {
  rules: ScoringRule[];
};

export type UpdateScoringRuleset = {
  name: string;
  description?: string;
  thresholds: number[];
  cooldownSeconds?: number;
  rules: { stableId?: string; name: string; description?: string; ast: AstNode }[];
};

export const adaptScoringRuleset = (dto: ScoringRulesetDto): ScoringRuleset => ({
  id: dto.id,
  orgId: dto.org_id,
  version: dto.version,
  status: dto.status,
  name: dto.name,
  description: dto.description,
  recordType: dto.record_type,
  thresholds: dto.thresholds,
  cooldownSeconds: dto.cooldown_seconds,
  createdAt: dto.created_at,
});

export const adaptScoringRulesetWithRules = (dto: ScoringRulesetWithRulesDto): ScoringRulesetWithRules => ({
  ...adaptScoringRuleset(dto),
  rules: (dto.rules ?? []).map(adaptScoringRule),
});

export const SCORING_LEVELS_COLORS = {
  3: ['#18AA5F', '#EEA200', '#FF6600'],
  4: ['#18AA5F', '#EEA200', '#FF6600', '#D2371D'],
  5: ['#89D4AD', '#FFD57E', '#FDBD35', '#FF6600', '#D2371D'],
  6: ['#89D4AD', '#FFD57E', '#FDBD35', '#FF6600', '#DB5F4A', '#D2371D'],
};

export const SCORING_LEVELS_LABELS = {
  3: ['Low', 'Medium', 'High'],
  4: ['Low', 'Medium', 'High', 'Very high'],
  5: ['1', '2', '3', '4', '5'],
  6: ['1', '2', '3', '4', '5', '6'],
};

// Switch Ast Node helpers

const allowedRuleSourceTypes = ['Bool', 'Int', 'Float', 'String'] as const;

export type AllowedScoringRuleSourceType = (typeof allowedRuleSourceTypes)[number];

export function isAllowedScoringRuleType(type: string | null): type is AllowedScoringRuleSourceType {
  return allowedRuleSourceTypes.includes(type as AllowedScoringRuleSourceType);
}

export function getOperationType(
  entityType: string,
  dataModel: DataModel,
  node: SwitchAstNode,
): AllowedScoringRuleSourceType | 'Undefined' | null {
  const entityTable = dataModel.find((table) => table.name === entityType);
  if (!entityTable || !node.namedChildren.type || !isConstant(node.namedChildren.type)) {
    return null;
  }

  switch (node.namedChildren.type.constant) {
    case 'user_attribute': {
      const astField = node.namedChildren.field;
      if (!astField || !isPayload(astField)) {
        return 'Undefined';
      }
      const field = entityTable.fields.find((f) => f.name === astField.children[0].constant);
      if (!field || !isAllowedScoringRuleType(field.dataType)) {
        return null;
      }
      return field.dataType;
    }
    default:
      return null;
  }
}

export type ScoreImpact = {
  modifier: number;
  floor?: number;
};

export type NumberSwitch = {
  type: 'number';
  branches: {
    value: number;
    impact: ScoreImpact;
  }[];
  default: ScoreImpact;
};

export type StringOperation =
  | {
      op: 'equal';
      value: string;
    }
  | {
      op: 'is_in';
      value: string[];
    };

export type StringSwitch = {
  type: 'string';
  branches: {
    value: StringOperation;
    impact: ScoreImpact;
  }[];
  default: ScoreImpact;
};

export type BoolSwitch = {
  type: 'bool';
  ifTrue: ScoreImpact;
  ifFalse: ScoreImpact;
};

export type CompleteUserAttributeRule = {
  type: 'user_attribute';
  field: PayloadAstNode;
  conditions: NumberSwitch | StringSwitch | BoolSwitch;
};

type EmptyUserAttributeRule = { type: 'user_attribute'; field: null; conditions: null };

export type UserAttributeRule = CompleteUserAttributeRule | EmptyUserAttributeRule;

export type CompleteAggregateRule = {
  type: 'aggregate';
  field: AggregationAstNode;
  conditions: NumberSwitch | StringSwitch | BoolSwitch;
};

type EmptyAggregateRule = { type: 'aggregate'; field: null; conditions: null };

export type AggregateRule = CompleteAggregateRule | EmptyAggregateRule;

export type RuleModel = UserAttributeRule | AggregateRule; // | ObjectTagRule | ScreeningTagRule | PastAlertRule;

export function isCompleteRuleModel(model: RuleModel): model is CompleteUserAttributeRule | CompleteAggregateRule {
  return model.field !== null;
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

export function transformSwitchAstNodeToModel(
  node: SwitchAstNode,
  entityType?: string,
  dataModel?: DataModel,
): RuleModel | null {
  if (!isConstant(node.namedChildren.type)) return null;
  const type = node.namedChildren.type.constant;
  if (type !== 'user_attribute' && type !== 'aggregate') return null;

  const scoreComputationNodes = node.children.filter(isScoreComputationAstNode) as ScoreComputationAstNode[];

  // Empty node (new rule) → return the null-field variant
  if (scoreComputationNodes.length === 0) return { type, field: null, conditions: null };

  const fieldType = entityType && dataModel ? getOperationType(entityType, dataModel, node) : null;

  const conditions =
    fieldType === 'Bool' ? parseBoolBranches(scoreComputationNodes) : parseNumberBranches(scoreComputationNodes);
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

export function buildSwitchAstNodeFromModel(model: CompleteUserAttributeRule | CompleteAggregateRule): SwitchAstNode {
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

function buildConditionChildren(field: AstNode, conditions: NumberSwitch | StringSwitch | BoolSwitch): AstNode[] {
  switch (conditions.type) {
    case 'number':
      return buildNumberSwitchChildren(field, conditions);
    case 'bool':
      return buildBoolSwitchChildren(field, conditions);
    case 'string':
      return [];
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
