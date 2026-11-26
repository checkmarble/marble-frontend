import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type AstNode,
  adaptNodeDto,
  isMarbleError,
  isStatusBadRequestHttpError,
  isStatusConflictHttpError,
} from '@app-builder/models';
import { type AstValidation, adaptAstValidation } from '@app-builder/models/ast-validation';
import { type ReturnValueType } from '@app-builder/models/node-evaluation';
import {
  adaptScenario,
  adaptScenarioCreateInputDto,
  type Scenario,
  type ScenarioCreateInput,
} from '@app-builder/models/scenario';
import {
  adaptScenarioIteration,
  adaptScenarioIterationWithoutRules,
  adaptUpdateScenarioIterationBody,
  type ScenarioIteration,
  type ScenarioIterationWithoutRules,
  type UpdateScenarioIterationBody,
} from '@app-builder/models/scenario/iteration';
import {
  adaptCreateScenarioPublicationBodyDto,
  adaptScenarioPublicationStatus,
  type CreateScenarioPublicationBody,
  IsDraftError,
  PreparationIsRequiredError,
  PreparationServiceOccupied,
  type ScenarioPublicationStatus,
  ValidationError,
} from '@app-builder/models/scenario/publication';
import {
  adaptWorkflowAction,
  adaptWorkflowCondition,
  adaptWorkflowRule,
  type Rule,
  transformWorkflowAction,
  transformWorkflowCondition,
  type WorkflowAction,
  type WorkflowCondition,
} from '@app-builder/models/scenario/workflow';

export async function listScenarios(api: MarbleCoreApi): Promise<Scenario[]> {
  const scenarios = await api.listScenarios();
  return scenarios.map(adaptScenario);
}

export async function getScenario(api: MarbleCoreApi, { scenarioId }: { scenarioId: string }): Promise<Scenario> {
  const scenario = await api.getScenario(scenarioId);
  return adaptScenario(scenario);
}

export async function createScenario(api: MarbleCoreApi, args: ScenarioCreateInput): Promise<Scenario> {
  const scenario = await api.createScenario(adaptScenarioCreateInputDto(args));
  return adaptScenario(scenario);
}

export async function updateScenario(
  api: MarbleCoreApi,
  { scenarioId, name, description }: { scenarioId: string; name: string; description: string | null },
): Promise<Scenario> {
  const scenario = await api.updateScenario(scenarioId, {
    name,
    description: description ?? '',
  });
  return adaptScenario(scenario);
}

export async function archiveScenario(api: MarbleCoreApi, { scenarioId }: { scenarioId: string }): Promise<Scenario> {
  const scenario = await api.updateScenario(scenarioId, { archived: true });
  return adaptScenario(scenario);
}

export async function unarchiveScenario(api: MarbleCoreApi, { scenarioId }: { scenarioId: string }): Promise<Scenario> {
  const scenario = await api.updateScenario(scenarioId, { archived: false });
  return adaptScenario(scenario);
}

export async function setScenarioDeduplication(
  api: MarbleCoreApi,
  { scenarioId, enabled }: { scenarioId: string; enabled: boolean },
): Promise<Scenario> {
  const scenario = await api.updateScenario(scenarioId, { deduplicate_batch_objects: enabled });
  return adaptScenario(scenario);
}

export async function createScenarioIteration(
  api: MarbleCoreApi,
  { scenarioId }: { scenarioId: string },
): Promise<ScenarioIteration> {
  const scenarioIteration = await api.createScenarioIteration({
    scenario_id: scenarioId,
  });
  return adaptScenarioIteration(scenarioIteration);
}

export async function updateScenarioIteration(
  api: MarbleCoreApi,
  iterationId: string,
  input: UpdateScenarioIterationBody,
): Promise<ScenarioIteration> {
  const { iteration } = await api.updateScenarioIteration(iterationId, adaptUpdateScenarioIterationBody(input));
  return adaptScenarioIteration(iteration);
}

// The backend returns the full iteration; dropping the rules here keeps them out of loaders and the client.
export async function getScenarioIterationWithoutRules(
  api: MarbleCoreApi,
  { iterationId }: { iterationId: string },
): Promise<ScenarioIterationWithoutRules> {
  const scenarioIteration = await api.getScenarioIteration(iterationId);
  return adaptScenarioIterationWithoutRules(scenarioIteration);
}

export async function validateAst(
  api: MarbleCoreApi,
  scenarioId: string,
  { node, expectedReturnType }: { node: AstNode; expectedReturnType?: ReturnValueType },
): Promise<AstValidation> {
  const { ast_validation } = await api.validateAstNode(scenarioId, {
    node: adaptNodeDto(node),
    expected_return_type: expectedReturnType,
  });

  return adaptAstValidation(ast_validation, expectedReturnType);
}

export async function getPublicationPreparationStatus(
  api: MarbleCoreApi,
  { iterationId }: { iterationId: string },
): Promise<ScenarioPublicationStatus> {
  const status = await api.getScenarioPublicationPreparationStatus(iterationId);
  return adaptScenarioPublicationStatus(status);
}

export async function startPublicationPreparation(
  api: MarbleCoreApi,
  { iterationId }: { iterationId: string },
): Promise<void> {
  try {
    await api.startScenarioPublicationPreparation({
      scenario_iteration_id: iterationId,
    });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      throw new PreparationServiceOccupied(error.message);
    }
    throw error;
  }
}

export async function createScenarioPublication(
  api: MarbleCoreApi,
  args: CreateScenarioPublicationBody,
): Promise<void> {
  try {
    await api.createScenarioPublication(adaptCreateScenarioPublicationBodyDto(args));
  } catch (error) {
    if (isStatusBadRequestHttpError(error) && isMarbleError(error)) {
      const errorCode = error.data.error_code;
      if (errorCode === 'scenario_iteration_is_invalid') {
        throw new ValidationError(error.message);
      }
      if (errorCode === 'scenario_iteration_requires_preparation') {
        throw new PreparationIsRequiredError(error.message);
      }
      if (errorCode === 'scenario_iteration_is_draft') {
        throw new IsDraftError(error.message);
      }
      if (errorCode === 'data_preparation_service_unavailable') {
        throw new PreparationServiceOccupied(error.message);
      }
    }
    throw error;
  }
}

export async function scheduleScenarioExecution(
  api: MarbleCoreApi,
  { iterationId, deduplicateObjects }: { iterationId: string; deduplicateObjects?: boolean },
): Promise<void> {
  const body = deduplicateObjects !== undefined ? { deduplicate_objects: deduplicateObjects } : undefined;
  await api.scheduleScenarioExecution(iterationId, body);
}

export async function getWorkflowRule(api: MarbleCoreApi, { ruleId }: { ruleId: string }): Promise<Rule> {
  const rule = await api.getWorkflowRule(ruleId);
  return adaptWorkflowRule({
    ...rule,
    conditions: rule.conditions ?? [],
    actions: rule.actions ?? [],
  });
}

export async function createWorkflowRule(
  api: MarbleCoreApi,
  { scenarioId, name, fallthrough }: { scenarioId: string; name: string; fallthrough: boolean },
): Promise<Rule> {
  const rule = await api.createWorkflowRule({
    scenario_id: scenarioId,
    name,
    fallthrough: fallthrough ?? false,
  });
  return adaptWorkflowRule({ ...rule, conditions: [], actions: [] });
}

export async function updateWorkflowRule(
  api: MarbleCoreApi,
  { ruleId, name, fallthrough }: { ruleId: string; name: string; fallthrough: boolean },
): Promise<Rule> {
  const rule = await api.updateWorkflowRule(ruleId, {
    name,
    fallthrough: fallthrough ?? false,
  });
  return adaptWorkflowRule({ ...rule, conditions: [], actions: [] });
}

export async function createWorkflowCondition(
  api: MarbleCoreApi,
  { ruleId, condition }: { ruleId: string; condition: WorkflowCondition },
): Promise<WorkflowCondition> {
  const newCondition = await api.createWorkflowCondition(ruleId, transformWorkflowCondition(condition));
  return adaptWorkflowCondition(newCondition);
}

export async function updateWorkflowCondition(
  api: MarbleCoreApi,
  { ruleId, conditionId, condition }: { ruleId: string; conditionId: string; condition: WorkflowCondition },
): Promise<WorkflowCondition> {
  const updatedCondition = await api.updateWorkflowCondition(
    ruleId,
    conditionId,
    transformWorkflowCondition(condition),
  );
  return adaptWorkflowCondition(updatedCondition);
}

export async function createWorkflowAction(
  api: MarbleCoreApi,
  { ruleId, action }: { ruleId: string; action: WorkflowAction },
): Promise<WorkflowAction> {
  const newAction = await api.createWorkflowAction(ruleId, transformWorkflowAction(action));
  return adaptWorkflowAction(newAction);
}

export async function updateWorkflowAction(
  api: MarbleCoreApi,
  { ruleId, actionId, action }: { ruleId: string; actionId: string; action: WorkflowAction },
): Promise<WorkflowAction> {
  const updatedAction = await api.updateWorkflowAction(ruleId, actionId, transformWorkflowAction(action));
  return adaptWorkflowAction(updatedAction);
}
