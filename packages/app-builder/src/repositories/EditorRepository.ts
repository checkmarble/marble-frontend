import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptAstNode } from '@app-builder/models';
import {
  type DatabaseAccessAstNode,
  isDatabaseAccess,
  isPayload,
  type PayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';

export interface EditorRepository {
  listAccessors(args: { scenarioId: string }): Promise<{
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
  }>;
  // listOperators(args: { scenarioId: string }): Promise<OperatorOption[]>;
}

export function makeGetEditorRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): EditorRepository => ({
    listAccessors: async ({ scenarioId }) => {
      const { database_accessors, payload_accessors } =
        await marbleCoreApiClient.listIdentifiers(scenarioId);
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
            throw Error("a payload_accessors is not a 'Payload'");
          }
          return true;
        });

      return {
        databaseAccessors,
        payloadAccessors,
      };
    },
  });
}
