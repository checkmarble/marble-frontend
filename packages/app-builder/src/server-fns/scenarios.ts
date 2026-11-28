import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type AstNode, type DataModel } from '@app-builder/models';
import { type AstValidation, type ScenarioValidationErrorCode } from '@app-builder/models/ast-validation';
import { isKnownOperandAstNode, isLeafOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import {
  type DatabaseAccessAstNode,
  NewDatabaseAccessAstNode,
  NewPayloadAstNode,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { type CustomList } from '@app-builder/models/custom-list';
import { isStatusBadRequestHttpError, isStatusConflictHttpError } from '@app-builder/models/http-errors';
import {
  type EvaluationError,
  type NodeEvaluation,
  type ReturnValue,
  type ReturnValueType,
} from '@app-builder/models/node-evaluation';
import { adaptSnoozesOfIteration, type RuleSnoozeInformation } from '@app-builder/models/rule-snooze';
import { adaptScenario } from '@app-builder/models/scenario';
import { adaptScenarioIteration } from '@app-builder/models/scenario/iteration';
import { type ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import {
  IsDraftError,
  PreparationIsRequiredError,
  PreparationServiceOccupied,
  ValidationError,
} from '@app-builder/models/scenario/publication';
import { type ScoringSettings } from '@app-builder/models/scoring';
import {
  activateIterationPayloadSchema,
  archiveScenarioPayloadSchema,
  commitIterationPayloadSchema,
  copyScenarioPayloadSchema,
  createScenarioPayloadSchema,
  createTestRunPayloadSchema,
  deactivateIterationPayloadSchema,
  deleteRulePayloadSchema,
  duplicateRulePayloadSchema,
  generateRuleInputSchema,
  prepareIterationPayloadSchema,
  toggleScenarioDeduplicationPayloadSchema,
  unarchiveScenarioPayloadSchema,
  updateScenarioPayloadSchema,
} from '@app-builder/schemas/scenarios';
import { listConfigurations } from '@app-builder/server/continuous-screening';
import { listCustomLists } from '@app-builder/server/custom-lists';
import { getDataModel } from '@app-builder/server/data-model';
import {
  createRule,
  generateRuleAst,
  getRule,
  getRuleDescription,
  listRules,
} from '@app-builder/server/scenario-iteration-rules';
import { createScreeningConfig } from '@app-builder/server/scenario-iteration-screenings';
import {
  archiveScenario,
  createScenario,
  createScenarioIteration,
  createScenarioPublication,
  getPublicationPreparationStatus,
  getScenario,
  getScenarioIterationWithoutRules,
  scheduleScenarioExecution,
  setScenarioDeduplication,
  startPublicationPreparation,
  unarchiveScenario,
  updateScenario,
  updateScenarioIteration,
  validateAst,
} from '@app-builder/server/scenarios';
import { launchTestRun } from '@app-builder/server/test-runs';
import { getSettings, listRulesets } from '@app-builder/server/user-scoring';
import { hasAnyEntitlement, isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { getFixedT } from '@app-builder/services/i18n/i18next.server';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/tanstackstart-react';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import * as R from 'remeda';
import { z } from 'zod/v4';

export type AstValidationPayload = {
  node: AstNode;
  expectedReturnType?: ReturnValueType;
};

type UnifiedEvaluationError = {
  error: EvaluationError['error'];
  message: string;
  path: string | undefined;
};

function adaptUnifiedEvaluationError(error: EvaluationError | UnifiedEvaluationError): UnifiedEvaluationError {
  return {
    error: error.error,
    message: error.message,
    path: error.path ?? (error as EvaluationError).argumentIndex?.toString() ?? (error as EvaluationError).argumentName,
  };
}

function getErrorsForChild(errors: UnifiedEvaluationError[], indexOrKey: string) {
  return R.pipe(
    errors,
    R.filter((err) => {
      if (err.path === undefined) return false;
      return err.path === indexOrKey || err.path.startsWith(`${indexOrKey}.`);
    }),
    R.map((err) => {
      let fieldPath = err.path;
      if (fieldPath != undefined) {
        if (fieldPath === indexOrKey) {
          fieldPath = undefined;
        } else if (fieldPath?.toString().startsWith(`${indexOrKey}.`)) {
          fieldPath = (fieldPath as string).replace(new RegExp(`^${indexOrKey}\\.`), '');
        }
      }
      return { ...err, path: fieldPath };
    }),
  );
}

export type FlatNodeEvaluationRow = {
  returnValue: ReturnValue;
  errors: EvaluationError[];
  skipped?: boolean;
  nodeId: string;
  relatedIds: string[];
};
export type FlatNodeEvaluation = FlatNodeEvaluationRow[];

export type FlatAstValidation = {
  errors: ScenarioValidationErrorCode[];
  evaluation: FlatNodeEvaluation;
};

export type AstValidationReturnType = {
  original: AstValidation;
  flat: FlatAstValidation;
};

export function generateFlatEvaluation(
  node: AstNode,
  evaluation: NodeEvaluation,
  relatedIds: string[] = [],
): FlatNodeEvaluation {
  const isOperandNode = isKnownOperandAstNode(node);
  const errors = R.map(evaluation.errors, adaptUnifiedEvaluationError);

  const currentRelatedId = isOperandNode ? [node.id] : [...relatedIds, node.id];

  const childrenEvaluations = node.children.flatMap((childNode, i) => {
    const childEvaluation = evaluation.children[i];
    if (!childEvaluation) return [];

    const childErrorsFromParent = getErrorsForChild(errors, i.toString());
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent],
    };

    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });

  const namedChildrenEvaluations = R.entries(node.namedChildren).flatMap(([key, childNode]) => {
    const childEvaluation = evaluation.namedChildren[key];
    if (!childEvaluation) return [];

    const childErrorsFromParent = getErrorsForChild(errors, key);
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent],
    };

    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });

  const hasChildError =
    childrenEvaluations.filter((e) => e.errors.length > 0).length > 0 ||
    namedChildrenEvaluations.filter((e) => e.errors.length > 0).length > 0;

  const currentErrors: EvaluationError[] = [
    ...errors.filter((err) => !err.path),
    ...(hasChildError && isLeafOperandAstNode(node)
      ? [{ error: 'FUNCTION_ERROR' as const, message: 'function has error' }]
      : []),
  ];
  const currentNodeEvaluation: FlatNodeEvaluationRow = {
    returnValue: evaluation.returnValue,
    errors: currentErrors,
    skipped: evaluation.skipped,
    nodeId: node.id,
    relatedIds: [...relatedIds, node.id],
  };

  return [currentNodeEvaluation, ...childrenEvaluations, ...namedChildrenEvaluations];
}

export type BuilderOptionsResource = {
  customLists: CustomList[];
  triggerObjectType: string;
  dataModel: DataModel;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  hasValidLicense?: boolean;
  hasContinuousScreening?: boolean;
  screeningConfigs: ContinuousScreeningConfig[];
  hasScoringRuleset: boolean;
  scoringSettings: ScoringSettings | null;
};

export function buildPayloadAccessorsFromDataModel(dataModel: DataModel, triggerObjectType: string): PayloadAstNode[] {
  const table = dataModel.find((t) => t.name === triggerObjectType);
  if (!table) return [];
  return table.fields.map((f) => NewPayloadAstNode(f.name));
}

export function buildDatabaseAccessorsFromDataModel(
  dataModel: DataModel,
  triggerObjectType: string,
): DatabaseAccessAstNode[] {
  const triggerTable = dataModel.find((t) => t.name === triggerObjectType);
  if (!triggerTable) return [];

  const accessors: DatabaseAccessAstNode[] = [];

  function recurse(path: string[], linksToSingle: DataModel[number]['linksToSingle'], visited: string[]) {
    for (const link of linksToSingle) {
      const linkedTable = dataModel.find((t) => t.name === link.parentTableName);
      if (!linkedTable || visited.includes(linkedTable.name)) continue;

      const pathForLink = [...path, link.name];

      for (const field of linkedTable.fields) {
        if (field.hidden) continue;
        accessors.push(
          NewDatabaseAccessAstNode({
            tableName: triggerObjectType,
            fieldName: field.name,
            path: pathForLink,
          }),
        );
      }

      recurse(pathForLink, linkedTable.linksToSingle, [...visited, linkedTable.name]);
    }
  }

  recurse([], triggerTable.linksToSingle, [triggerTable.name]);

  return accessors;
}

// ---- Scenario CRUD ----

export const archiveScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(archiveScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await archiveScenario(context.api, { scenarioId: data.scenarioId });
      throw redirect({ to: '/detection/scenarios' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to archive scenario');
    }
  });

export const copyScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(copyScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    const scenario = await context.api.copyScenario(data.scenarioId, { name: data.name || undefined });
    return adaptScenario(scenario);
  });

export const createScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const createdScenario = await createScenario(context.api, data);
      const scenarioIteration = await createScenarioIteration(context.api, {
        scenarioId: createdScenario.id,
      });
      throw redirect({
        href: `/detection/scenarios/${fromUUIDtoSUUID(createdScenario.id)}/i/${fromUUIDtoSUUID(scenarioIteration.id)}`,
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to create scenario');
    }
  });

export const unarchiveScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(unarchiveScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await unarchiveScenario(context.api, { scenarioId: data.scenarioId });
    } catch {
      throw new Error('Failed to unarchive scenario');
    }
  });

export const updateScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await updateScenario(context.api, data);
    } catch {
      throw new Error('Failed to update scenario');
    }
  });

export const toggleScenarioDeduplicationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(toggleScenarioDeduplicationPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await setScenarioDeduplication(context.api, {
        scenarioId: data.scenarioId,
        enabled: data.enabled,
      });
    } catch {
      throw new Error('Failed to update scenario deduplication');
    }
  });

// ---- Rule description ----

export const getRuleDescriptionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      scenarioId: z.string(),
      astNode: z.unknown(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { description, isRuleValid } = await getRuleDescription(context.api, {
      scenarioId: data.scenarioId,
      astNode: data.astNode as AstNode,
    });
    return { description, isRuleValid };
  });

// ---- Builder options ----

export const getBuilderOptionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string() }))
  .handler(async ({ context, data }): Promise<BuilderOptionsResource> => {
    const { api, entitlements } = context;

    const [currentScenario, customLists, dataModel, screeningConfigs, scoringRulesets, scoringSettings] =
      await Promise.all([
        getScenario(api, { scenarioId: data.scenarioId }),
        listCustomLists(api),
        getDataModel(api),
        isContinuousScreeningAvailable(entitlements) ? listConfigurations(api) : Promise.resolve([]),
        listRulesets(api),
        getSettings(api),
      ]);

    return {
      triggerObjectType: currentScenario.triggerObjectType,
      customLists,
      dataModel,
      databaseAccessors: buildDatabaseAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
      payloadAccessors: buildPayloadAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
      hasValidLicense: hasAnyEntitlement(entitlements),
      hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
      screeningConfigs,
      hasScoringRuleset: scoringRulesets.length > 0,
      scoringSettings,
    };
  });

// ---- Validate AST ----

export const validateAstFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      scenarioId: z.string(),
      node: z.unknown(),
      expectedReturnType: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }): Promise<AstValidationReturnType> => {
    try {
      const res = await validateAst(context.api, data.scenarioId, {
        node: data.node as AstNode,
        expectedReturnType: data.expectedReturnType as ReturnValueType | undefined,
      });

      const flatEval = generateFlatEvaluation(data.node as AstNode, res.evaluation);
      return {
        original: res,
        flat: { errors: res.errors, evaluation: flatEval },
      };
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Validation failed');
    }
  });

// ---- Generate AST ----

export const generateAstFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(generateRuleInputSchema)
  .handler(async ({ context, data }) => {
    try {
      const result = await generateRuleAst(context.api, {
        scenarioId: data.scenarioId,
        ruleId: data.ruleId,
        instruction: data.instruction,
      });
      return { success: true, ...result };
    } catch {
      return { success: false };
    }
  });

// ---- Rule catalog ----

export const getRuleCatalogFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.api.getRuleCatalog();
  });

// ---- Scenario iteration: activate, commit, create-draft, deactivate, prepare ----

const saveTriggerPayloadSchema = z.object({
  iterationId: z.string(),
  schedule: z.string(),
  astNode: z.any(),
});

export type SaveTriggerPayload = z.infer<typeof saveTriggerPayloadSchema>;

export const saveTriggerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(saveTriggerPayloadSchema)
  .handler(async function saveTriggerAction({ context, data: { iterationId, schedule, astNode } }) {
    await updateScenarioIteration(context.api, iterationId, {
      triggerConditionAstExpression: astNode,
      schedule,
    });
  });

export const activateIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(activateIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    try {
      await createScenarioPublication(context.api, {
        publicationAction: 'publish',
        scenarioIterationId: data.iterationId,
      });
      throw redirect({
        to: '/detection/scenarios/$scenarioId/i/$iterationId',
        params: {
          scenarioId: fromUUIDtoSUUID(data.scenarioId),
          iterationId: fromUUIDtoSUUID(data.iterationId),
        },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      if (error instanceof ValidationError) return { error: 'validation_error' as const };
      if (error instanceof PreparationIsRequiredError) return { error: 'preparation_is_required' as const };
      if (error instanceof PreparationServiceOccupied) return { error: 'preparation_service_occupied' as const };
      if (error instanceof IsDraftError) return { error: 'is_draft' as const };
      return { error: 'unknown' as const };
    }
  });

export const commitIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(commitIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    try {
      await context.api.commitScenarioIteration(data.iterationId);
      throw redirect({
        to: '/detection/scenarios/$scenarioId/i/$iterationId',
        params: {
          scenarioId: fromUUIDtoSUUID(data.scenarioId),
          iterationId: fromUUIDtoSUUID(data.iterationId),
        },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      if (isStatusBadRequestHttpError(error)) return { error: 'validation_error' as const };
      return { error: 'unknown' as const };
    }
  });

export const createDraftIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    const iteration = await context.api.createDraftFromScenarioIteration(data.iterationId);
    return adaptScenarioIteration(iteration);
  });

export const deactivateIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deactivateIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    try {
      await createScenarioPublication(context.api, {
        publicationAction: 'unpublish',
        scenarioIterationId: data.iterationId,
      });
      throw redirect({
        to: '/detection/scenarios/$scenarioId/i/$iterationId',
        params: {
          scenarioId: fromUUIDtoSUUID(data.scenarioId),
          iterationId: fromUUIDtoSUUID(data.iterationId),
        },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to deactivate iteration');
    }
  });

export const prepareIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(prepareIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    try {
      await startPublicationPreparation(context.api, { iterationId: data.iterationId });
      throw redirect({
        to: '/detection/scenarios/$scenarioId/i/$iterationId',
        params: {
          scenarioId: fromUUIDtoSUUID(data.scenarioId),
          iterationId: fromUUIDtoSUUID(data.iterationId),
        },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      if (error instanceof PreparationServiceOccupied) return { error: 'preparation_service_occupied' as const };
      return { error: 'unknown' as const };
    }
  });

export const getPublicationPreparationStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    return getPublicationPreparationStatus(context.api, { iterationId: data.iterationId });
  });

export const getRuleSnoozeFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ iterationId: z.string() }))
  .handler(async ({ context, data }): Promise<{ ruleSnoozes: RuleSnoozeInformation[] }> => {
    const { snoozes } = await context.api.getScenarioIterationActiveSnoozes(data.iterationId);
    const { ruleSnoozes } = adaptSnoozesOfIteration(snoozes);
    return { ruleSnoozes };
  });

// ---- Rules ----

export const createRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    return createRule(context.api, {
      scenarioIterationId: data.iterationId,
      displayOrder: 1,
      formula: null,
      name: '',
      description: '',
      ruleGroup: '',
      scoreModifier: 0,
    });
  });

export const deleteRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteRulePayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    await context.api.deleteScenarioIterationRule(data.ruleId);
    throw redirect({
      to: '/detection/scenarios/$scenarioId/i/$iterationId/rules',
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId),
      },
    });
  });

export const duplicateRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(duplicateRulePayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await getFixedT(request, ['scenarios']);
    const { createdAt: _, name, ...rest } = await getRule(context.api, { ruleId: data.ruleId });

    return await createRule(context.api, {
      name: t('scenarios:clone_rule.default_name', { name }),
      ...rest,
    });
  });

// ---- Screenings ----

export const createScreeningRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    const config = await createScreeningConfig(context.api, {
      iterationId: data.iterationId,
      changes: {
        name: '',
        ruleGroup: 'Screening',
        forcedOutcome: 'block_and_review',
      },
    });

    if (!config.id) {
      throw new Error('Screening created without id');
    }

    return { ...config, id: config.id };
  });

export const deleteScreeningRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), iterationId: z.string(), screeningId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.api.deleteScreeningConfig(data.iterationId, data.screeningId);
    throw redirect({
      to: '/detection/scenarios/$scenarioId/i/$iterationId/rules',
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId),
      },
    });
  });

// ---- Test runs ----

export const cancelTestRunFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ scenarioId: z.string(), testRunId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.api.cancelTestRun(data.testRunId);
      throw redirect({
        to: '/detection/scenarios/$scenarioId/test-run',
        params: { scenarioId: fromUUIDtoSUUID(data.scenarioId) },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      throw new Error('Failed to cancel test run');
    }
  });

export const createTestRunFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createTestRunPayloadSchema.and(z.object({ scenarioId: z.string() })))
  .handler(async ({ context, data }) => {
    const { scenarioId, ...payload } = data;
    try {
      await launchTestRun(context.api, { ...payload, scenarioId });
      throw redirect({
        href: `/detection/scenarios/${fromUUIDtoSUUID(scenarioId)}/test-run`,
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      if (isStatusConflictHttpError(error)) return { error: 'duplicate_test_run' as const };
      return { error: 'unknown' as const };
    }
  });

// ---- Iteration rules ----

export const getIterationRulesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ iterationId: z.string() }))
  .handler(async ({ context, data }): Promise<{ rules: ScenarioIterationRule[]; archived: boolean }> => {
    const [rules, scenarioIteration] = await Promise.all([
      listRules(context.api, { scenarioIterationId: data.iterationId }),
      getScenarioIterationWithoutRules(context.api, { iterationId: data.iterationId }),
    ]);
    return { rules, archived: scenarioIteration.archived };
  });

export const getIterationRuleFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ ruleId: z.string() }))
  .handler(async ({ context, data }) => {
    return { rule: await getRule(context.api, { ruleId: data.ruleId }) };
  });

export const triggerManualExecutionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      iterationId: z.string(),
      forceRescore: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await scheduleScenarioExecution(context.api, {
      iterationId: data.iterationId,
      deduplicateObjects: data.forceRescore ? false : undefined,
    });
    return { status: 'success' as const };
  });

const MAX_SCORE_THRESHOLD = 10000;

const saveScenarioDecisionPayloadSchema = z
  .object({
    iterationId: z.string(),
    scoreReviewThreshold: z.number().int().min(-MAX_SCORE_THRESHOLD).max(MAX_SCORE_THRESHOLD),
    scoreBlockAndReviewThreshold: z.number().int().min(-MAX_SCORE_THRESHOLD).max(MAX_SCORE_THRESHOLD),
    scoreDeclineThreshold: z.number().int().min(-MAX_SCORE_THRESHOLD).max(MAX_SCORE_THRESHOLD),
  })
  .refine((v) => v.scoreBlockAndReviewThreshold >= v.scoreReviewThreshold)
  .refine((v) => v.scoreDeclineThreshold >= v.scoreBlockAndReviewThreshold);

export const saveScenarioDecisionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(saveScenarioDecisionPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const { iterationId, ...thresholds } = data;
      await updateScenarioIteration(context.api, iterationId, thresholds);
      return { status: 'success' as const };
    } catch {
      return { status: 'error' as const };
    }
  });
