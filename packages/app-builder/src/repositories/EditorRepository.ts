import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptAstNode, type AstNode } from '@app-builder/models';
import {
  adaptAstOperatorDto,
  type AstOperator,
} from '@app-builder/models/ast-operators';
import {
  adaptIdentifierDto,
  type EditorIdentifier,
} from '@app-builder/models/identifier';

export interface EditorRepository {
  listIdentifiers(args: { scenarioId: string }): Promise<{
    databaseAccessors: EditorIdentifier[];
    payloadAccessors: EditorIdentifier[];
    customListAccessors: EditorIdentifier[];
  }>;
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
