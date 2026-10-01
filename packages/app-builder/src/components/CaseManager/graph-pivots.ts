import { createGraphTypeHelpers } from '@app-builder/components/Graph/lib/data-model-map';
import { type DataModel } from '@app-builder/models';
import { type CaseClient } from '@app-builder/models/cases';

/** A client the graph can start from: ingested, identified, and backed by a person table. */
export type GraphEligibleClient = CaseClient & { objectId: string };

export function isGraphEligibleClient(client: CaseClient, dataModel: DataModel): client is GraphEligibleClient {
  if (!client.isIngested || !client.objectId) return false;
  return createGraphTypeHelpers(dataModel).isPersonType(client.tableName);
}

export function getGraphEligibleClients(clients: CaseClient[], dataModel: DataModel): GraphEligibleClient[] {
  return clients.filter((client) => isGraphEligibleClient(client, dataModel));
}
