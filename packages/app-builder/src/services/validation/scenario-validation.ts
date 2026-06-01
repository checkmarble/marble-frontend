import { type ScenarioValidation, type ScreeningConfigValidation } from '@app-builder/models';
import { type EvaluationError, NewNodeEvaluation, type NodeEvaluation } from '@app-builder/models/node-evaluation';
import { isQueryFieldFilled } from '@app-builder/utils/screening-form-validation';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import invariant from 'tiny-invariant';

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

  invariant(ruleValidation !== undefined, `Rule ${ruleId} not found in validation`);

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

export function hasRuleErrors(ruleValidation: ScenarioValidation['rules']['ruleItems'][number]): boolean {
  return ruleValidation.errors.length > 0 || countNodeEvaluationErrors(ruleValidation.ruleEvaluation) > 0;
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
const AGGREGATE_QUERY_REQUIRED_ERROR: ScenarioValidationErrorCodeDto = 'RULE_FORMULA_REQUIRED';

export type ScreeningValidationOptions = {
  /** Screening edit UI only edits per-field query AST; hide legacy aggregate `query` validation. */
  ignoreLegacyAggregateQuery?: boolean;
  /** Current form query values; used to ignore stale per-field required-formula errors. */
  formQuery?: Record<string, unknown>;
};

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

  for (const [fieldKey, field] of Object.entries(screening.queryFields)) {
    if (shouldSuppressQueryFieldError(fieldKey, field, options)) {
      continue;
    }
    if (field.errors.length > 0) return true;
    if (countNodeEvaluationErrors(field.queryEvaluation) > 0) return true;
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

export function collectScreeningValidationMessages(
  screening: ScreeningConfigValidation,
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
  labels: ScreeningValidationSectionLabels,
  options?: ScreeningValidationOptions,
): string[] {
  const messages = new Set<string>();

  addSectionMessages(
    messages,
    labels.trigger,
    screening.trigger.errors,
    screening.trigger.triggerEvaluation,
    getScenarioErrorMessage,
  );

  if (!options?.ignoreLegacyAggregateQuery) {
    addSectionMessages(
      messages,
      labels.matchCriteria,
      screening.query.errors,
      screening.query.queryEvaluation,
      getScenarioErrorMessage,
    );
  }

  for (const [fieldKey, field] of Object.entries(screening.queryFields)) {
    if (shouldSuppressQueryFieldError(fieldKey, field, options)) {
      continue;
    }
    addSectionMessages(
      messages,
      labels.queryField(fieldKey),
      field.errors,
      field.queryEvaluation,
      getScenarioErrorMessage,
    );
  }

  addSectionMessages(
    messages,
    labels.counterparty,
    screening.counterpartyIdExpression.errors,
    screening.counterpartyIdExpression.counterpartyIdEvaluation,
    getScenarioErrorMessage,
  );

  return [...messages];
}

export function collectRuleValidationMessages(
  ruleValidation: ScenarioValidation['rules']['ruleItems'][number],
  getScenarioErrorMessage: (code: ScenarioValidationErrorCodeDto) => string,
  formulaSectionLabel: string,
): string[] {
  const messages = new Set<string>();

  addSectionMessages(
    messages,
    formulaSectionLabel,
    ruleValidation.errors,
    ruleValidation.ruleEvaluation,
    getScenarioErrorMessage,
  );

  return [...messages];
}
