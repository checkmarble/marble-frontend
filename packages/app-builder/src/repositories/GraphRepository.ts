import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCreateGraphRelationDto,
  adaptGraphData,
  adaptGraphRelation,
  type CreateGraphRelationBody,
  type GraphData,
  type GraphRelation,
} from '@app-builder/models/graph';

export interface GraphRepository {
  listRelations(): Promise<GraphRelation[]>;
  createRelation(body: CreateGraphRelationBody): Promise<GraphRelation>;
  deleteRelation(relationId: string): Promise<void>;
  generateGraph(recordType: string, recordId: string): Promise<GraphData>;
}

export function makeGetGraphRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): GraphRepository => ({
    listRelations: async () => {
      const relations = await marbleCoreApiClient.listGraphRelations();
      return relations.map(adaptGraphRelation);
    },
    createRelation: async (body) => {
      const relation = await marbleCoreApiClient.createGraphRelation(adaptCreateGraphRelationDto(body));
      return adaptGraphRelation(relation);
    },
    deleteRelation: async (relationId) => {
      await marbleCoreApiClient.deleteGraphRelation(relationId);
    },
    generateGraph: async (recordType, recordId) => {
      // Empty query-params object so auth opts are not bound to { types, degrees }.
      const graph = await marbleCoreApiClient.generateRelationshipGraph(recordType, recordId, {});
      return adaptGraphData(graph);
    },
  });
}
