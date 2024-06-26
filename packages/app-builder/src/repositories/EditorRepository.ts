import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptAstNode,
  type DatabaseAccessAstNode,
  isDatabaseAccess,
  isPayload,
  type PayloadAstNode,
} from '@app-builder/models';
import {
  isOperatorFunction,
  type OperatorFunction,
} from '@app-builder/models/editable-operators';
import * as R from 'remeda';

export interface EditorRepository {
  listAccessors(args: { scenarioId: string }): Promise<{
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
  }>;
  listOperators(args: { scenarioId: string }): Promise<OperatorFunction[]>;
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
    listOperators: async ({ scenarioId }) => {
      const { operators_accessors } =
        await marbleCoreApiClient.listOperators(scenarioId);

      const operatorFunctions = R.pipe(
        operators_accessors,
        R.map(({ name }) => name),
        R.filter(isOperatorFunction),
      );

      return operatorFunctions;
    },
  });
}
