import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptAstNode, type AstNode } from '@app-builder/models';
import { adaptIdentifierDto } from '@app-builder/models/identifier';

export type EditorRepository = ReturnType<typeof getEditorRepository>;

export function getEditorRepository() {
  return (marbleApiClient: MarbleApi) => ({
    listIdentifiers: async ({ scenarioId }: { scenarioId: string }) => {
      const { database_accessors, payload_accessors, custom_list_accessors } = await marbleApiClient.listIdentifiers(
        scenarioId
      );
      const databaseAccessors = database_accessors.map(adaptIdentifierDto);
      const payloadAccessors = payload_accessors.map(adaptIdentifierDto);
      const customListAccessors = custom_list_accessors.map(adaptIdentifierDto);

      return { databaseAccessors, payloadAccessors, customListAccessors };
    },
    saveRule: async ({
      ruleId,
      astNode,
    }: {
      ruleId: string;
      astNode: AstNode;
    }) => {
      return marbleApiClient.saveRule({
        rule_id: ruleId,
        expression: adaptAstNode(astNode),
      });
    },
  });
}
