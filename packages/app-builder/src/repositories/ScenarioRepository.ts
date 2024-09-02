import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptNodeDto,
  adaptScenarioValidation,
  type AstNode,
  isMarbleError,
  isStatusBadRequestHttpError,
  isStatusConflictHttpError,
  type ScenarioValidation,
} from '@app-builder/models';
import {
  adaptSnoozesOfIteration,
  type SnoozesOfIteration,
} from '@app-builder/models/rule-snooze';
import {
  adaptScenario,
  adaptScenarioCreateInputDto,
  adaptScenarioUpdateInputDto,
  type Scenario,
  type ScenarioCreateInput,
  type ScenarioUpdateWorkflowInput,
} from '@app-builder/models/scenario';
import {
  adaptScenarioIteration,
  adaptScenarioIterationSummary,
  type ScenarioIteration,
  type ScenarioIterationSummary,
} from '@app-builder/models/scenario-iteration';
import {
  adaptScenarioPublicationStatus,
  type ScenarioPublicationStatus,
} from '@app-builder/models/scenario-publication';
import { findRuleValidation } from '@app-builder/services/validation/scenario-validation';

export interface ScenarioRepository {
  listScenarios(): Promise<Scenario[]>;
  getScenario(args: { scenarioId: string }): Promise<Scenario>;
  createScenario(args: ScenarioCreateInput): Promise<Scenario>;
  updateScenario(args: {
    scenarioId: string;
    name: string;
    description: string | null;
  }): Promise<Scenario>;
  updateScenarioWorkflow(
    scenarioId: string,
    args: ScenarioUpdateWorkflowInput,
  ): Promise<Scenario>;
  createScenarioIteration(args: {
    scenarioId: string;
  }): Promise<ScenarioIteration>;
  getScenarioIteration(args: {
    iterationId: string;
  }): Promise<ScenarioIteration>;
  listScenarioIterations(args: {
    scenarioId: string;
  }): Promise<ScenarioIterationSummary[]>;
  validate(args: { iterationId: string }): Promise<ScenarioValidation>;
  validateTrigger(args: {
    iterationId: string;
    trigger: AstNode;
  }): Promise<ScenarioValidation['trigger']>;
  validateRule(args: {
    iterationId: string;
    rule: AstNode;
    ruleId: string;
  }): Promise<ScenarioValidation['rules']['ruleItems'][number]>;
  commitScenarioIteration(args: {
    iterationId: string;
  }): Promise<ScenarioIteration>;
  getPublicationPreparationStatus(args: {
    iterationId: string;
  }): Promise<ScenarioPublicationStatus>;
  startPublicationPreparation(args: { iterationId: string }): Promise<void>;
  createScenarioPublication(args: {
    publicationAction: 'publish' | 'unpublish';
    scenarioIterationId: string;
  }): Promise<void>;
  getScenarioIterationActiveSnoozes(
    scenarioIterationId: string,
  ): Promise<SnoozesOfIteration>;
}

export function makeGetScenarioRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScenarioRepository => ({
    listScenarios: async () => {
      const scenarios = await marbleCoreApiClient.listScenarios();
      return scenarios.map(adaptScenario);
    },
    getScenario: async ({ scenarioId }) => {
      const scenario = await marbleCoreApiClient.getScenario(scenarioId);
      return adaptScenario(scenario);
    },
    createScenario: async (args) => {
      const scenario = await marbleCoreApiClient.createScenario(
        adaptScenarioCreateInputDto(args),
      );
      return adaptScenario(scenario);
    },
    updateScenario: async ({ scenarioId, name, description }) => {
      const scenario = await marbleCoreApiClient.updateScenario(scenarioId, {
        name,
        description: description ?? '',
      });
      return adaptScenario(scenario);
    },
    updateScenarioWorkflow: async (scenarioId, args) => {
      const scenario = await marbleCoreApiClient.updateScenario(
        scenarioId,
        adaptScenarioUpdateInputDto(args),
      );
      return adaptScenario(scenario);
    },
    createScenarioIteration: async ({ scenarioId }) => {
      const scenarioIteration =
        await marbleCoreApiClient.createScenarioIteration({
          scenarioId,
        });
      return adaptScenarioIteration(scenarioIteration);
    },
    getScenarioIteration: async ({ iterationId }) => {
      const scenarioIteration =
        await marbleCoreApiClient.getScenarioIteration(iterationId);
      return adaptScenarioIteration(scenarioIteration);
    },
    listScenarioIterations: async ({ scenarioId }) => {
      const dtos = await marbleCoreApiClient.listScenarioIterations({
        scenarioId,
      });
      return dtos.map(adaptScenarioIterationSummary);
    },
    validate: async ({ iterationId }) => {
      const { scenario_validation } =
        await marbleCoreApiClient.validateScenarioIteration(
          iterationId,
          undefined,
        );
      return adaptScenarioValidation(scenario_validation);
    },
    validateTrigger: async ({ iterationId, trigger }) => {
      const { scenario_validation } =
        await marbleCoreApiClient.validateScenarioIteration(iterationId, {
          trigger_or_rule: adaptNodeDto(trigger),
          rule_id: null,
        });
      return adaptScenarioValidation(scenario_validation).trigger;
    },
    validateRule: async ({ iterationId, rule, ruleId }) => {
      const { scenario_validation } =
        await marbleCoreApiClient.validateScenarioIteration(iterationId, {
          trigger_or_rule: adaptNodeDto(rule),
          rule_id: ruleId,
        });
      return findRuleValidation(
        adaptScenarioValidation(scenario_validation),
        ruleId,
      );
    },
    commitScenarioIteration: async ({ iterationId }) => {
      const { iteration } =
        await marbleCoreApiClient.commitScenarioIteration(iterationId);
      return adaptScenarioIteration(iteration);
    },
    getPublicationPreparationStatus: async ({ iterationId }) => {
      const status =
        await marbleCoreApiClient.getScenarioPublicationPreparationStatus(
          iterationId,
        );
      return adaptScenarioPublicationStatus(status);
    },
    startPublicationPreparation: async ({ iterationId }) => {
      try {
        await marbleCoreApiClient.startScenarioPublicationPreparation({
          scenario_iteration_id: iterationId,
        });
      } catch (error) {
        if (isStatusConflictHttpError(error)) {
          throw new PreparationServiceOccupied(error.message);
        }
        throw error;
      }
    },
    createScenarioPublication: async (args) => {
      try {
        await marbleCoreApiClient.createScenarioPublication(args);
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
    },
    getScenarioIterationActiveSnoozes: async (scenarioIterationId) => {
      const { snoozes } =
        await marbleCoreApiClient.getScenarioIterationActiveSnoozes(
          scenarioIterationId,
        );
      return adaptSnoozesOfIteration(snoozes);
    },
  });
}

/**
 * The error thrown when a scenario iteration validation fails.
 */
export class ValidationError extends Error {}
/**
 * The error thrown when a scenario iteration to be activated requires preparation.
 */
export class PreparationIsRequiredError extends Error {}
/**
 * The error thrown when a scenario iteration to be activated is a draft.
 */
export class IsDraftError extends Error {}
/**
 * The error thrown when the preparation service is occupied.
 */
export class PreparationServiceOccupied extends Error {}
