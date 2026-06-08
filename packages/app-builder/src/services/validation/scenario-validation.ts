import { type AstNode, type ScenarioValidation, type ScreeningConfigValidation } from '@app-builder/models';
import { type EvaluationError, NewNodeEvaluation, type NodeEvaluation } from '@app-builder/models/node-evaluation';
import { hasFilledRuleFormula } from '@app-builder/utils/rule-form-validation';
import {
  hasAnyFilledQueryField,
  hasRequiredScreeningCriteria,
  isQueryFieldFilled,
  type ScreeningValidationIssue,
  type ScreeningValidationSectionId,
  type ScreeningValidationSource,
} from '@app-builder/utils/screening-form-validation';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';

// return just an array of error from a recursive evaluation
export function flattenNodeEvaluationErrors(evaluation: NodeEvaluation): EvaluationError[] {
  return [
    ...(evaluation.errors ?? []),
    ...evaluation.children.flatMap(flattenNodeEvaluationErrors),
    ...Object.values(evaluation.namedChildren).flatMap(flattenNodeEvaluationErrors),
  ];
}

export function findRuleValidation(validation: ScenarioValidation, ruleId: string) {
  const ruleValidation = validation.rules.ruleItems[ruleId];

  if (ruleValidation === undefined) {
    return {
      errors: [],
      ruleEvaluation: NewNodeEvaluation(),
    };
  }

  return ruleValidation;
}

export function countNodeEvaluationErrors(evaluation: NodeEvaluation): number {
  return flattenNodeEvaluationErrors(evaluation).length;
}

export function hasTriggerErrors(validation: ScenarioValidation): boolean {
  if (validation.trigger.errors.length > 0) return true;

  if (countNodeEvaluationErrors(validation.trigger.triggerEvaluation) > 0) return true;

  return false;
}

export function hasRulesErrors(validation: ScenarioValidation): boolean {
  if (validation.rules.errors.length > 0) return true;

  for (const rule of Object.values(validation.rules.ruleItems)) {
    if (hasRuleErrors(rule)) return true;
  }

  return false;
}

export function hasDecisionErrors(validation: ScenarioValidation): boolean {
  if (validation.decision.errors.length > 0) return true;

  return false;
}

const RULE_FORMULA_REQUIRED_ERROR: ScenarioValidationErrorCodeDto = 'RULE_FORMULA_REQUIRED';

export type RuleValidationOptions = {
  /** Current form formula; used to ignore stale server RULE_FORMULA_REQUIRED after the user adds a condition. */
  formFormula?: AstNode | null;
};

function applyRuleValidationOptions(
  ruleValidation: ScenarioValidation['rules']['ruleItems'][number],
  options?: RuleValidationOptions,
): ScenarioValidation['rules']['ruleItems'][number] {
  if (!options?.formFormula || !hasFilledRuleFormula(options.formFormula)) {
    return ruleValidation;
  }

  return {
    ...ruleValidation,
    errors: ruleValidation.errors.filter((error) => error !== RULE_FORMULA_REQUIRED_ERROR),
  };
}

export function hasRuleErrors(
  ruleValidation: ScenarioValidation['rules']['ruleItems'][number],
  options?: RuleValidationOptions,
): boolean {
  const effectiveValidation = applyRuleValidationOptions(ruleValidation, options);
  return effectiveValidation.errors.length > 0 || countNodeEvaluationErrors(effectiveValidation.ruleEvaluation) > 0;
}

export function findScreeningValidation(validation: ScenarioValidation, screeningId: string) {
  // Try to find by ID first (if indexed by ID)
  let screeningValidation = validation.screeningConfigs[screeningId];

  // If not found, return empty validation
  if (screeningValidation === undefined) {
    const emptyEvaluation = NewNodeEvaluation();
    return {
      trigger: { errors: [], triggerEvaluation: emptyEvaluation },
      query: { errors: [], queryEvaluation: emptyEvaluation },
      queryFields: {},
      counterpartyIdExpression: { errors: [], counterpartyIdEvaluation: emptyEvaluation },
    };
  }

  return screeningValidation;
}

/** Backend validates a legacy aggregate `query` AST separate from per-field `query_fields` the UI edits. */
const AGGREGATE_QUERY_REQUIRED_ERROR = RULE_FORMULA_REQUIRED_ERROR;

export type ScreeningValidationOptions = {
  /** Screening edit UI only edits per-field query AST; hide legacy aggregate `query` validation. */
  ignoreLegacyAggregateQuery?: boolean;
  /** Current form query values; used to ignore stale per-field required-formula errors. */
  formQuery?: Record<string, unknown>;
  /** Entity type for the screening; used with formQuery to detect satisfied match criteria. */
  entityType?: 'Person' | 'Organization' | 'Vehicle' | 'Thing';
};

/** Skip stale server `query_fields` validation when the form already has valid match criteria. */
function shouldSkipServerQueryFieldValidation(options?: ScreeningValidationOptions): boolean {
  if (!options?.ignoreLegacyAggregateQuery || !options.formQuery) {
    return false;
  }
  return (
    hasRequiredScreeningCriteria(options.entityType, options.formQuery) || hasAnyFilledQueryField(options.formQuery)
  );
}

function shouldSuppressQueryFieldError(
  fieldKey: string,
  field: ScreeningConfigValidation['queryFields'][string],
  options?: ScreeningValidationOptions,
): boolean {
  if (!options?.formQuery || !isQueryFieldFilled(options.formQuery[fieldKey])) {
    return false;
  }
  if (field.errors.some((code) => code !== AGGREGATE_QUERY_REQUIRED_ERROR)) {
    return false;
  }
  return field.errors.length > 0 || countNodeEvaluationErrors(field.queryEvaluation) > 0;
}

export function hasScreeningErrors(
  screening: ScreeningConfigValidation,
  options?: ScreeningValidationOptions,
): boolean {
  // Check trigger errors
  if (screening.trigger.errors.length > 0) return true;
  if (countNodeEvaluationErrors(screening.trigger.triggerEvaluation) > 0) return true;

  if (!options?.ignoreLegacyAggregateQuery) {
    if (screening.query.errors.length > 0) return true;
    if (countNodeEvaluationErrors(screening.query.queryEvaluation) > 0) return true;
  }

  if (!shouldSkipServerQueryFieldValidation(options)) {
    for (const [fieldKey, field] of Object.entries(screening.queryFields)) {
      if (shouldSuppressQueryFieldError(fieldKey, field, options)) {
        continue;
      }
      if (field.errors.length > 0) return true;
      if (countNodeEvaluationErrors(field.queryEvaluation) > 0) return true;
    }
  }

  // Check counterparty ID expression errors
  if (screening.counterpartyIdExpression.errors.length > 0) return true;
  if (countNodeEvaluationErrors(screening.counterpartyIdExpression.counterpartyIdEvaluation) > 0) return true;

  return false;
}

export function hasScreeningsErrors(validation: ScenarioValidation): boolean {
  for (const screening of Object.values(validation.screeningConfigs)) {
    if (hasScreeningErrors(screening)) return true;
  }

  return false;
}

function collectEvaluationErrorMessages(evaluation: NodeEvaluation): string[] {
  return flattenNodeEvaluationErrors(evaluation).map((error) => error.message);
}

export type ScreeningValidationSectionLabels = {
  trigger: string;
  counterparty: string;
  matchCriteria: string;
  queryField: (fieldKey: string) => string;
};

function prefixValidationMessage(section: string, message: string): string {
  return `${section}: ${message}`;
}

function screeningSourceForSection(section: ScreeningValidationSectionId): ScreeningValidationSource {
  return { type: 'section', section };
}

function screeningSourceForQueryField(fieldKey: string): ScreeningValidationSource {
  return { type: 'field', field: `query.${fieldKey}` };
}

function addSectionMessages(
  messages: Set<string>,
  section: string,
  codes: ScenarioValidationErrorCodeDto[],
  evaluation: NodeEvaluation,
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
) {
  for (const code of codes) {
    messages.add(prefixValidationMessage(section, getScenarioErrorMessage(code)));
  }
  for (const message of collectEvaluationErrorMessages(evaluation)) {
    messages.add(prefixValidationMessage(section, message));
  }
}

function addSectionIssues(
  issues: ScreeningValidationIssue[],
  source: ScreeningValidationSource,
  sectionLabel: string,
  codes: ScenarioValidationErrorCodeDto[],
  evaluation: NodeEvaluation,
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
) {
  for (const code of codes) {
    issues.push({
      message: prefixValidationMessage(sectionLabel, getScenarioErrorMessage(code)),
      source,
    });
  }
  for (const message of collectEvaluationErrorMessages(evaluation)) {
    issues.push({
      message: prefixValidationMessage(sectionLabel, message),
      source,
    });
  }
}

export function collectScreeningValidationIssues(
  screening: ScreeningConfigValidation,
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
  labels: ScreeningValidationSectionLabels,
  options?: ScreeningValidationOptions,
): ScreeningValidationIssue[] {
  const issues: ScreeningValidationIssue[] = [];

  addSectionIssues(
    issues,
    screeningSourceForSection('trigger'),
    labels.trigger,
    screening.trigger.errors,
    screening.trigger.triggerEvaluation,
    getScenarioErrorMessage,
  );

  if (!options?.ignoreLegacyAggregateQuery) {
    addSectionIssues(
      issues,
      screeningSourceForSection('matchSettings'),
      labels.matchCriteria,
      screening.query.errors,
      screening.query.queryEvaluation,
      getScenarioErrorMessage,
    );
  }

  if (!shouldSkipServerQueryFieldValidation(options)) {
    for (const [fieldKey, field] of Object.entries(screening.queryFields)) {
      if (shouldSuppressQueryFieldError(fieldKey, field, options)) {
        continue;
      }
      addSectionIssues(
        issues,
        screeningSourceForQueryField(fieldKey),
        labels.queryField(fieldKey),
        field.errors,
        field.queryEvaluation,
        getScenarioErrorMessage,
      );
    }
  }

  addSectionIssues(
    issues,
    screeningSourceForSection('counterparty'),
    labels.counterparty,
    screening.counterpartyIdExpression.errors,
    screening.counterpartyIdExpression.counterpartyIdEvaluation,
    getScenarioErrorMessage,
  );

  return issues;
}

export function collectScreeningValidationMessages(
  screening: ScreeningConfigValidation,
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
  labels: ScreeningValidationSectionLabels,
  options?: ScreeningValidationOptions,
): string[] {
  return collectScreeningValidationIssues(screening, getScenarioErrorMessage, labels, options).map(
    (issue) => issue.message,
  );
}

export function collectRuleValidationMessages(
  ruleValidation: ScenarioValidation['rules']['ruleItems'][number],
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
  formulaSectionLabel: string,
  options?: RuleValidationOptions,
): string[] {
  const effectiveValidation = applyRuleValidationOptions(ruleValidation, options);
  const messages = new Set<string>();

  addSectionMessages(
    messages,
    formulaSectionLabel,
    effectiveValidation.errors,
    effectiveValidation.ruleEvaluation,
    getScenarioErrorMessage,
  );

  return [...messages];
}
