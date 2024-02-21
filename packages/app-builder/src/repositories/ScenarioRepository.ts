import { type MarbleApi } from '@app-builder/infra/marble-api';
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
  adaptScenarioIteration,
  adaptScenarioIterationRule,
  adaptScenarioIterationSummary,
  adaptScenarioPublicationStatus,
  type ScenarioIteration,
  type ScenarioIterationRule,
  type ScenarioIterationSummary,
  type ScenarioPublicationStatus,
} from '@app-builder/models/scenario';
import { findRuleValidation } from '@app-builder/services/validation/scenario-validation';
import { type Scenario } from 'marble-api';

export interface ScenarioRepository {
  listScenarios(): Promise<Scenario[]>;
  createScenario(args: {
    name: string;
    description: string;
    triggerObjectType: string;
  }): Promise<Scenario>;
  updateScenario(args: {
    scenarioId: string;
    name: string;
    description: string | null;
  }): Promise<Scenario>;
  createScenarioIteration(args: {
    scenarioId: string;
  }): Promise<ScenarioIteration>;
  getScenarioIterationRule(args: {
    ruleId: string;
  }): Promise<ScenarioIterationRule>;
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
}

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi): ScenarioRepository => ({
    listScenarios: async () => {
      const scenarios = await marbleApiClient.listScenarios();
      return scenarios;
    },
    createScenario: async (args) => {
      const scenario = await marbleApiClient.createScenario(args);
      return scenario;
    },
    updateScenario: async ({ scenarioId, name, description }) => {
      const scenario = await marbleApiClient.updateScenario(scenarioId, {
        name,
        description: description ?? '',
      });
      return scenario;
    },
    createScenarioIteration: async ({ scenarioId }) => {
      const scenarioIteration = await marbleApiClient.createScenarioIteration({
        scenarioId,
      });
      return adaptScenarioIteration(scenarioIteration);
    },
    getScenarioIterationRule: async ({ ruleId }) => {
      const { rule } = await marbleApiClient.getScenarioIterationRule(ruleId);

      return adaptScenarioIterationRule(rule);
    },
    getScenarioIteration: async ({ iterationId }) => {
      const scenarioIteration =
        await marbleApiClient.getScenarioIteration(iterationId);
      return adaptScenarioIteration(scenarioIteration);
    },
    listScenarioIterations: async ({ scenarioId }) => {
      const dtos = await marbleApiClient.listScenarioIterations({ scenarioId });
      return dtos.map(adaptScenarioIterationSummary);
    },
    validate: async ({ iterationId }) => {
      const { scenario_validation } =
        await marbleApiClient.validateScenarioIteration(iterationId, undefined);
      return adaptScenarioValidation(scenario_validation);
    },
    validateTrigger: async ({ iterationId, trigger }) => {
      const { scenario_validation } =
        await marbleApiClient.validateScenarioIteration(iterationId, {
          trigger_or_rule: adaptNodeDto(trigger),
          rule_id: null,
        });
      return adaptScenarioValidation(scenario_validation).trigger;
    },
    validateRule: async ({ iterationId, rule, ruleId }) => {
      const { scenario_validation } =
        await marbleApiClient.validateScenarioIteration(iterationId, {
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
        await marbleApiClient.commitScenarioIteration(iterationId);
      return adaptScenarioIteration(iteration);
    },
    getPublicationPreparationStatus: async ({ iterationId }) => {
      const status =
        await marbleApiClient.getScenarioPublicationPreparationStatus(
          iterationId,
        );
      return adaptScenarioPublicationStatus(status);
    },
    startPublicationPreparation: async ({ iterationId }) => {
      try {
        await marbleApiClient.startScenarioPublicationPreparation({
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
        await marbleApiClient.createScenarioPublication(args);
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
