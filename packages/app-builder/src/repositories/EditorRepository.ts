import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptAstNode,
  adaptNodeDto,
  type AstNode,
  type DatabaseAccessAstNode,
  type EditorIdentifiersByType,
  isDatabaseAccess,
  isPayload,
  type PayloadAstNode,
} from '@app-builder/models';
import {
  adaptAstOperatorDto,
  type AstOperator,
} from '@app-builder/models/ast-operators';

export interface EditorRepository {
  listIdentifiers(args: {
    scenarioId: string;
  }): Promise<EditorIdentifiersByType>;
  listOperators(args: { scenarioId: string }): Promise<AstOperator[]>;
  saveRule(args: {
    ruleId: string;
    astNode: AstNode;
    displayOrder?: number;
    name?: string;
    description?: string;
    scoreModifier?: number;
  }): Promise<void>;
}

export function getEditorRepository() {
  return (marbleApiClient: MarbleApi): EditorRepository => ({
    listIdentifiers: async ({
      scenarioId,
    }): Promise<EditorIdentifiersByType> => {
      const { database_accessors, payload_accessors } =
        await marbleApiClient.listIdentifiers(scenarioId);
      const databaseAccessors = database_accessors
        .map(adaptAstNode)
        .filter((node): node is DatabaseAccessAstNode => {
          if (!isDatabaseAccess(node)) {
            throw Error("a payload_accessors not a 'DatabaseAccess'");
          }
          return true;
        });
      const payloadAccessors = payload_accessors
        .map(adaptAstNode)
        .filter((node): node is PayloadAstNode => {
          if (!isPayload(node)) {
            throw Error("a payload_accessorsis not a 'Payload'");
          }
          return true;
        });

      return {
        databaseAccessors,
        payloadAccessors,
      };
    },
    listOperators: async ({ scenarioId }) => {
      const { operators_accessors } = await marbleApiClient.listOperators(
        scenarioId
      );
      const operatorsAccessors = operators_accessors.map(adaptAstOperatorDto);

      return operatorsAccessors;
    },
    saveRule: async ({
      ruleId,
      astNode,
      displayOrder,
      name,
      description,
      scoreModifier,
    }) => {
      await marbleApiClient.updateScenarioIterationRule(ruleId, {
        displayOrder,
        name,
        description,
        formula_ast_expression: adaptNodeDto(astNode),
        scoreModifier,
      });
    },
  });
}
