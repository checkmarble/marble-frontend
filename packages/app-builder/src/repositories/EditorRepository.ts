import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptAstNode,
  type AstNode,
  type EvaluationError,
  type NodeEvaluation,
  type ScenarioValidation,
} from '@app-builder/models';
import { adaptAstOperatorDto } from '@app-builder/models/ast-operators';
import { adaptIdentifierDto } from '@app-builder/models/identifier';
import type {
  EvaluationErrorDto,
  NodeEvaluationDto,
  ScenarioValidationDto,
} from '@marble-api';
import * as R from 'remeda';

export type EditorRepository = ReturnType<typeof getEditorRepository>;

function adaptEvaluationError(dto: EvaluationErrorDto): EvaluationError {
  return {
    code: dto.code,
    message: dto.message,
  };
}

function adaptNodeEvaluation(dto: NodeEvaluationDto): NodeEvaluation {
  return {
    returnValue: dto.return_value,
    errors: dto.errors === null ? null : dto.errors.map(adaptEvaluationError),
    children: dto.children ? dto.children.map(adaptNodeEvaluation) : [],
    namedChildren: dto.named_children
      ? R.mapValues(dto.named_children, adaptNodeEvaluation)
      : {},
  };
}

export function adaptScenarioValidation(
  dto: ScenarioValidationDto
): ScenarioValidation {
  return {
    errors: dto.errors,
    triggerEvaluation: adaptNodeEvaluation(dto.trigger_evaluation),
    rulesEvaluations: R.mapValues(dto.rules_evaluations, adaptNodeEvaluation),
  };
}

// return just an array of error from a recursive evaluation
export function flattenNodeEvaluationErrors(
  evaluation: NodeEvaluation
): EvaluationError[] {
  return [
    ...(evaluation.errors ?? []),
    ...evaluation.children.map(flattenNodeEvaluationErrors).flat(),
    ...Object.values(evaluation.namedChildren)
      .map(flattenNodeEvaluationErrors)
      .flat(),
  ];
}

export function countValidationErrors(validation: ScenarioValidation): number {
  return (
    validation.errors.length +
    [
      validation.triggerEvaluation,
      ...Object.values(validation.rulesEvaluations),
    ].reduce(
      (acc, evaluation) => acc + flattenNodeEvaluationErrors(evaluation).length,
      0
    )
  );
}

export function countRuleValidationErrors(evaluation: NodeEvaluation): number {
  return flattenNodeEvaluationErrors(evaluation).length;
}

export function getEditorRepository() {
  return (marbleApiClient: MarbleApi) => ({
    listIdentifiers: async ({ scenarioId }: { scenarioId: string }) => {
      const { database_accessors, payload_accessors, custom_list_accessors } =
        await marbleApiClient.listIdentifiers(scenarioId);
      const databaseAccessors = database_accessors.map(
        adaptIdentifierDto ?? []
      );
      const payloadAccessors = payload_accessors.map(adaptIdentifierDto ?? []);
      const customListAccessors = custom_list_accessors.map(
        adaptIdentifierDto ?? []
      );

      return { databaseAccessors, payloadAccessors, customListAccessors };
    },
    listOperators: async ({ scenarioId }: { scenarioId: string }) => {
      const { operators_accessors } = await marbleApiClient.listOperators(
        scenarioId
      );
      const operatorsAccessors = operators_accessors.map(adaptAstOperatorDto);

      return operatorsAccessors;
    },
    validate: async ({ iterationId }: { iterationId: string }) => {
      const result = await marbleApiClient.validateScenarioIteration(
        iterationId
      );
      return adaptScenarioValidation(result.scenario_validation);
    },
    saveRule: async ({
      ruleId,
      astNode,
      displayOrder,
      name,
      description,
      scoreModifier,
    }: {
      ruleId: string;
      astNode: AstNode;
      displayOrder?: number;
      name?: string;
      description?: string;
      scoreModifier?: number;
    }) => {
      await marbleApiClient.updateScenarioIterationRule(ruleId, {
        displayOrder,
        name,
        description,
        formula_ast_expression: adaptAstNode(astNode),
        scoreModifier,
      });
    },
  });
}
