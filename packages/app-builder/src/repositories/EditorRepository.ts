import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptAstNode, adaptNodeDto, type AstNode } from '@app-builder/models';

export type EditorRepository = ReturnType<typeof getEditorRepository>;

export function getEditorRepository() {
  return (marbleApiClient: MarbleApi) => ({
    listIdentifiers: async ({ scenarioId }: { scenarioId: string }) => {
      const { data_accessors } = await marbleApiClient.listIdentifiers(
        scenarioId
      );

      const dataAccessors = data_accessors.map(adaptNodeDto);

      return { dataAccessors };
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
