import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptNodeDto } from '@app-builder/models';

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
  });
}
