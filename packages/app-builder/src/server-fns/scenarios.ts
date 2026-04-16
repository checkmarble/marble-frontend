import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type AstNode, type DataModel } from '@app-builder/models';
import { type AstValidation, type ScenarioValidationErrorCode } from '@app-builder/models/ast-validation';
import { isKnownOperandAstNode, isLeafOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type DatabaseAccessAstNode, type PayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { type CustomList } from '@app-builder/models/custom-list';
import { isStatusBadRequestHttpError, isStatusConflictHttpError } from '@app-builder/models/http-errors';
import {
  type EvaluationError,
  type NodeEvaluation,
  type ReturnValue,
  type ReturnValueType,
} from '@app-builder/models/node-evaluation';
import { type RuleSnoozeInformation } from '@app-builder/models/rule-snooze';
import { type ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import {
  IsDraftError,
  PreparationIsRequiredError,
  PreparationServiceOccupied,
  ValidationError,
} from '@app-builder/repositories/ScenarioRepository';
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
  unarchiveScenarioPayloadSchema,
  updateScenarioPayloadSchema,
} from '@app-builder/schemas/scenarios';
import { hasAnyEntitlement, isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { setToast } from '@app-builder/services/toast.server';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/tanstackstart-react';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import * as R from 'remeda';
import { z } from 'zod/v4';

// ---- Types moved from validate-ast route ----

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

export type AstValidationFunction = (node: AstNode, expectedReturnType?: ReturnValueType) => Promise<NodeEvaluation>;

// ---- Type moved from builder-options route ----

export type BuilderOptionsResource = {
  customLists: CustomList[];
  triggerObjectType: string;
  dataModel: DataModel;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  hasValidLicense?: boolean;
  hasContinuousScreening?: boolean;
  screeningConfigs: ContinuousScreeningConfig[];
};

// ---- Scenario CRUD ----

export const archiveScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(archiveScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.scenario.archiveScenario({ scenarioId: data.scenarioId });
      throw redirect({ to: '/detection/scenarios' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to archive scenario');
    }
  });

export const copyScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(copyScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.scenario.copyScenario({
        scenarioId: data.scenarioId,
        name: data.name || undefined,
      });
      throw redirect({ to: '/detection/scenarios' });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to copy scenario');
    }
  });

export const createScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const createdScenario = await context.authInfo.scenario.createScenario(data);
      const scenarioIteration = await context.authInfo.scenario.createScenarioIteration({
        scenarioId: createdScenario.id,
      });
      throw redirect({
        href: `/detection/scenarios/${fromUUIDtoSUUID(createdScenario.id)}/i/${fromUUIDtoSUUID(scenarioIteration.id)}`,
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to create scenario');
    }
  });

export const unarchiveScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(unarchiveScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.scenario.unarchiveScenario({ scenarioId: data.scenarioId });
      await setToast({ type: 'success', messageKey: 'common:success.save' });
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to unarchive scenario');
    }
  });

export const updateScenarioFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateScenarioPayloadSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common']);
    try {
      await context.authInfo.scenario.updateScenario(data);
    } catch {
      await setToast({ type: 'error', message: t('common:errors.unknown') });
      throw new Error('Failed to update scenario');
    }
  });

// ---- Rule description ----

export const getRuleDescriptionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      scenarioId: z.string(),
      astNode: z.unknown(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { description, isRuleValid } = await context.authInfo.scenarioIterationRuleRepository.getRuleDescription({
      scenarioId: data.scenarioId,
      astNode: data.astNode as AstNode,
    });
    return { description, isRuleValid };
  });

// ---- Builder options ----

export const getBuilderOptionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string() }))
  .handler(async ({ context, data }): Promise<BuilderOptionsResource> => {
    const { editor, scenario, dataModelRepository, customListsRepository, continuousScreening, entitlements } =
      context.authInfo;

    const [currentScenario, customLists, dataModel, accessors, screeningConfigs] = await Promise.all([
      scenario.getScenario({ scenarioId: data.scenarioId }),
      customListsRepository.listCustomLists(),
      dataModelRepository.getDataModel(),
      editor.listAccessors({ scenarioId: data.scenarioId }),
      isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
    ]);

    return {
      triggerObjectType: currentScenario.triggerObjectType,
      customLists,
      dataModel,
      databaseAccessors: accessors.databaseAccessors,
      payloadAccessors: accessors.payloadAccessors,
      hasValidLicense: hasAnyEntitlement(entitlements),
      hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
      screeningConfigs,
    };
  });

// ---- Validate AST ----

export const validateAstFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      scenarioId: z.string(),
      node: z.unknown(),
      expectedReturnType: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }): Promise<AstValidationReturnType> => {
    try {
      const res = await context.authInfo.scenario.validateAst(data.scenarioId, {
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
  .inputValidator(generateRuleInputSchema)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'scenarios']);
    try {
      const result = await context.authInfo.scenarioIterationRuleRepository.generateRuleAst({
        scenarioId: data.scenarioId,
        ruleId: data.ruleId,
        instruction: data.instruction,
      });
      return { success: true, ...result };
    } catch {
      await setToast({ type: 'error', message: t('scenarios:rules.ai_generate.error_generating') });
      return { success: false };
    }
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
  .inputValidator(saveTriggerPayloadSchema)
  .handler(async function saveTriggerAction({ context, data: { iterationId, schedule, astNode } }) {
    const { scenario } = context.authInfo;

    await scenario.updateScenarioIteration(iterationId, {
      triggerConditionAstExpression: astNode,
      schedule,
    });
  });

export const activateIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(activateIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'scenarios']);
    try {
      await context.authInfo.scenario.createScenarioPublication({
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
      let formError: string;
      if (error instanceof ValidationError) {
        formError = t('scenarios:deployment_modal.activate.validation_error');
      } else if (error instanceof PreparationIsRequiredError) {
        formError = t('scenarios:deployment_modal.activate.preparation_is_required_error');
      } else if (error instanceof PreparationServiceOccupied) {
        formError = t('scenarios:deployment_modal.activate.preparation_service_occupied_error');
      } else if (error instanceof IsDraftError) {
        formError = t('scenarios:deployment_modal.activate.is_draft_error');
      } else {
        formError = t('common:errors.unknown');
      }
      await setToast({ type: 'error', message: formError });
      throw new Error('Failed to activate iteration');
    }
  });

export const commitIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(commitIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'scenarios']);
    try {
      await context.authInfo.scenario.commitScenarioIteration({ iterationId: data.iterationId });
      throw redirect({
        to: '/detection/scenarios/$scenarioId/i/$iterationId',
        params: {
          scenarioId: fromUUIDtoSUUID(data.scenarioId),
          iterationId: fromUUIDtoSUUID(data.iterationId),
        },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({
        type: 'error',
        message: isStatusBadRequestHttpError(error)
          ? t('scenarios:deployment_modal.commit.validation_error')
          : t('common:errors.unknown'),
      });
      throw new Error('Failed to commit iteration');
    }
  });

export const createDraftIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    return context.authInfo.apiClient.createDraftFromScenarioIteration(data.iterationId);
  });

export const deactivateIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deactivateIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'scenarios']);
    try {
      await context.authInfo.scenario.createScenarioPublication({
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
      await setToast({ type: 'error', message: t('common:errors.unknown') });
      throw new Error('Failed to deactivate iteration');
    }
  });

export const prepareIterationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(prepareIterationPayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common', 'scenarios']);
    try {
      await context.authInfo.scenario.startPublicationPreparation({ iterationId: data.iterationId });
      throw redirect({
        to: '/detection/scenarios/$scenarioId/i/$iterationId',
        params: {
          scenarioId: fromUUIDtoSUUID(data.scenarioId),
          iterationId: fromUUIDtoSUUID(data.iterationId),
        },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({
        type: 'error',
        message:
          error instanceof PreparationServiceOccupied
            ? t('scenarios:deployment_modal.prepare.preparation_service_occupied')
            : t('common:errors.unknown'),
      });
      throw new Error('Failed to prepare iteration');
    }
  });

export const getRuleSnoozeFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ iterationId: z.string() }))
  .handler(async ({ context, data }): Promise<{ ruleSnoozes: RuleSnoozeInformation[] }> => {
    const { ruleSnoozes } = await context.authInfo.scenario.getScenarioIterationActiveSnoozes(data.iterationId);
    return { ruleSnoozes };
  });

// ---- Rules ----

export const createRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['scenarios']);
    const rule = await context.authInfo.scenarioIterationRuleRepository.createRule({
      scenarioIterationId: data.iterationId,
      displayOrder: 1,
      formula: null,
      name: t('scenarios:create_rule.default_name'),
      description: '',
      ruleGroup: '',
      scoreModifier: 0,
    });
    throw redirect({
      to: '/detection/scenarios/$scenarioId/i/$iterationId/rules/$ruleId',
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId),
        ruleId: fromUUIDtoSUUID(rule.id),
      },
    });
  });

export const deleteRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteRulePayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    await context.authInfo.scenarioIterationRuleRepository.deleteRule({ ruleId: data.ruleId });
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
  .inputValidator(duplicateRulePayloadSchema.and(z.object({ scenarioId: z.string(), iterationId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['scenarios']);
    const {
      createdAt: _,
      name,
      ...rest
    } = await context.authInfo.scenarioIterationRuleRepository.getRule({ ruleId: data.ruleId });
    await context.authInfo.scenarioIterationRuleRepository.createRule({
      name: t('scenarios:clone_rule.default_name', { name }),
      ...rest,
    });
    throw redirect({
      to: '/detection/scenarios/$scenarioId/i/$iterationId/rules',
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId),
      },
    });
  });

// ---- Screenings ----

export const createScreeningRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string(), iterationId: z.string() }))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['scenarios']);
    const config = await context.authInfo.scenarioIterationScreeningRepository.createScreeningConfig({
      iterationId: data.iterationId,
      changes: {
        name: t('scenarios:create_sanction.default_name'),
        ruleGroup: 'Screening',
        forcedOutcome: 'block_and_review',
      },
    });
    throw redirect({
      to: '/detection/scenarios/$scenarioId/i/$iterationId/screenings/$screeningId',
      params: {
        scenarioId: fromUUIDtoSUUID(data.scenarioId),
        iterationId: fromUUIDtoSUUID(data.iterationId),
        screeningId: fromUUIDtoSUUID(config.id as string),
      },
      search: { isNew: 'true' },
    });
  });

export const deleteScreeningRuleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ scenarioId: z.string(), iterationId: z.string(), screeningId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.authInfo.scenarioIterationScreeningRepository.deleteScreeningConfig({
      iterationId: data.iterationId,
      screeningId: data.screeningId,
    });
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
  .inputValidator(z.object({ scenarioId: z.string(), testRunId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.testRun.cancelTestRun({ testRunId: data.testRunId });
      throw redirect({
        to: '/detection/scenarios/$scenarioId/test-run',
        params: { scenarioId: fromUUIDtoSUUID(data.scenarioId) },
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to cancel test run');
    }
  });

export const createTestRunFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createTestRunPayloadSchema.and(z.object({ scenarioId: z.string() })))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const t = await context.services.i18nextService.getFixedT(request, ['common']);
    const { scenarioId, ...payload } = data;
    try {
      await context.authInfo.testRun.launchTestRun({ ...payload, scenarioId });
      throw redirect({
        href: `/detection/scenarios/${fromUUIDtoSUUID(scenarioId)}/test-run`,
      });
    } catch (error) {
      if (error instanceof Response || (error as { _isRedirect?: boolean })._isRedirect) throw error;
      await setToast({
        type: 'error',
        messageKey: isStatusConflictHttpError(error)
          ? t('common:errors.data.duplicate_test_run')
          : t('common:errors.unknown'),
      });
      throw new Error('Failed to create test run');
    }
  });

// ---- Iteration rules ----

export const getIterationRulesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ iterationId: z.string() }))
  .handler(async ({ context, data }): Promise<{ rules: ScenarioIterationRule[]; archived: boolean }> => {
    const [rules, scenarioIteration] = await Promise.all([
      context.authInfo.scenarioIterationRuleRepository.listRules({ scenarioIterationId: data.iterationId }),
      context.authInfo.scenario.getScenarioIterationWithoutRules({ iterationId: data.iterationId }),
    ]);
    return { rules, archived: scenarioIteration.archived };
  });
