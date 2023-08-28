import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptAstNode,
  adaptIdentifierDto,
  type AstNode,
  type EditorIdentifiersByType,
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
    listIdentifiers: async ({ scenarioId }) => {
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
        formula_ast_expression: adaptAstNode(astNode),
        scoreModifier,
      });
    },
  });
}
