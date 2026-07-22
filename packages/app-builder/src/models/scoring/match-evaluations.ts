import { type NodeEvaluationDto } from 'marble-api';
import { type DataModel } from '..';
import { isConstant } from '../astNode/constant';
import { isScoreComputationAstNode, isSwitchAstNode } from '../astNode/control-flow';
import { adaptNodeEvaluation, hasReturnValue, type NodeEvaluation } from '../node-evaluation';
import { transformAstNodeToModel } from './ast-transform';
import { type ScoreImpact } from './conditions';
import { isCompleteRule, type RuleModel } from './rule-model';
import { type ScoringRule } from './ruleset';

export type MatchedScoreRule = {
  rule: ScoringRule;
  model: RuleModel | null;
  evaluation: NodeEvaluation;
  matchedBranchIndex: number | null;
  impact: ScoreImpact | null;
  appliedModifier: number | null;
};

export type MatchScoreEvaluationsResult =
  | { ok: true; rules: MatchedScoreRule[] }
  | { ok: false; reason: 'length_mismatch' | 'structure_mismatch' };

/** Switch return object from newer scoring evaluations. */
type SwitchReturnValue = {
  branch?: number;
  modifier?: number;
  floor?: number;
  triggered?: boolean;
  default?: boolean;
  fallback?: boolean;
};

/** True when the value is already a camelCase NodeEvaluation (vs API DTO). */
function isNodeEvaluation(value: NodeEvaluationDto | NodeEvaluation): value is NodeEvaluation {
  return 'returnValue' in value;
}

/** Normalize API DTOs to NodeEvaluation; leave adapted values as-is. */
function adaptEvaluation(value: NodeEvaluationDto | NodeEvaluation): NodeEvaluation {
  return isNodeEvaluation(value) ? value : adaptNodeEvaluation(value);
}

/** Read modifier (+ optional floor) from a ScoreComputation AST branch. */
function getScoreImpactFromAstChild(child: ScoringRule['ast']): ScoreImpact | null {
  if (!isScoreComputationAstNode(child)) return null;
  if (!isConstant(child.namedChildren.modifier)) return null;
  const impact: ScoreImpact = { modifier: child.namedChildren.modifier.constant };
  if (child.namedChildren.floor && isConstant(child.namedChildren.floor)) {
    impact.floor = child.namedChildren.floor.constant;
  }
  return impact;
}

function getSwitchReturnValue(evaluation: NodeEvaluation): SwitchReturnValue | null {
  if (!hasReturnValue(evaluation.returnValue)) return null;
  const value = evaluation.returnValue.value;
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as SwitchReturnValue;
}

/** Applied score modifier from Switch return_value (object or legacy number). */
function getAppliedModifier(evaluation: NodeEvaluation): number | null {
  if (!hasReturnValue(evaluation.returnValue)) return null;

  const value = evaluation.returnValue.value;
  if (typeof value === 'number') return value;

  const switchReturn = getSwitchReturnValue(evaluation);
  return typeof switchReturn?.modifier === 'number' ? switchReturn.modifier : null;
}

/**
 * Index of the Switch branch that fired.
 * Prefers Switch return_value.branch; falls back to modifier matching, then skipped flags.
 */
function findMatchedBranchIndex(
  evaluation: NodeEvaluation,
  astChildren: ScoringRule['ast']['children'],
): number | null {
  const switchReturn = getSwitchReturnValue(evaluation);
  if (
    typeof switchReturn?.branch === 'number' &&
    Number.isInteger(switchReturn.branch) &&
    switchReturn.branch >= 0 &&
    switchReturn.branch < astChildren.length
  ) {
    return switchReturn.branch;
  }

  const appliedModifier = getAppliedModifier(evaluation);

  if (appliedModifier !== null) {
    const matchingIndices: number[] = [];
    for (let i = 0; i < astChildren.length; i++) {
      const impact = getScoreImpactFromAstChild(astChildren[i]!);
      if (impact && impact.modifier === appliedModifier) {
        matchingIndices.push(i);
      }
    }

    if (matchingIndices.length === 1) {
      return matchingIndices[0]!;
    }

    if (matchingIndices.length > 1) {
      const nonSkippedAmongMatches = matchingIndices.filter((i) => evaluation.children[i]?.skipped !== true);
      const hasExplicitlySkippedSibling = matchingIndices.some((i) => evaluation.children[i]?.skipped === true);

      if (nonSkippedAmongMatches.length === 1 && hasExplicitlySkippedSibling) {
        return nonSkippedAmongMatches[0]!;
      }

      // Default/else is last in number/string/tags Switch layout
      return matchingIndices[matchingIndices.length - 1]!;
    }
  }

  // No usable Switch return: only trust skipped when it clearly distinguishes one branch
  const nonSkipped = evaluation.children
    .map((child, index) => ({ child, index }))
    .filter(({ child }) => child.skipped !== true);
  const hasExplicitlySkipped = evaluation.children.some((child) => child.skipped === true);

  if (nonSkipped.length === 1 && hasExplicitlySkipped) {
    return nonSkipped[0]!.index;
  }

  return null;
}

/**
 * Pair score evaluations with ruleset rules by array order.
 * Fails closed on length or Switch-structure mismatch (no partial/incorrect match).
 *
 * Evaluation trees may omit non-taken Switch branches, so children length need not
 * equal AST children length when return_value.branch identifies the match.
 */
export function matchScoreEvaluationsToRules(
  evaluations: Array<NodeEvaluationDto | NodeEvaluation>,
  rules: ScoringRule[],
  entityType: string,
  dataModel: DataModel,
): MatchScoreEvaluationsResult {
  if (evaluations.length !== rules.length) {
    return { ok: false, reason: 'length_mismatch' };
  }

  const adapted = evaluations.map(adaptEvaluation);
  const matched: MatchedScoreRule[] = [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]!;
    const evaluation = adapted[i]!;

    if (!isSwitchAstNode(rule.ast)) {
      return { ok: false, reason: 'structure_mismatch' };
    }

    // Only reject when the evaluation tree has more children than the rule AST.
    // Fewer children is expected when the engine skips / omits non-taken branches.
    if (evaluation.children.length > rule.ast.children.length) {
      return { ok: false, reason: 'structure_mismatch' };
    }

    const matchedBranchIndex = findMatchedBranchIndex(evaluation, rule.ast.children);
    const impact =
      matchedBranchIndex !== null ? getScoreImpactFromAstChild(rule.ast.children[matchedBranchIndex]!) : null;
    const draftModel = transformAstNodeToModel(rule.ast, entityType, dataModel);
    const model: RuleModel | null = draftModel && isCompleteRule(draftModel) ? draftModel : null;

    matched.push({
      rule,
      model,
      evaluation,
      matchedBranchIndex,
      impact,
      appliedModifier: getAppliedModifier(evaluation),
    });
  }

  return { ok: true, rules: matched };
}
