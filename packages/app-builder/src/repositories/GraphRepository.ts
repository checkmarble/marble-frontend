import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCreateGraphRelationDto,
  adaptGraphData,
  adaptGraphRelation,
  type CreateGraphRelationBody,
  type GraphData,
  type GraphRelation,
} from '@app-builder/models/graph';

export type GenerateGraphQuery = {
  degrees?: number;
  types?: string;
};

export interface GraphRepository {
  listRelations(): Promise<GraphRelation[]>;
  createRelation(body: CreateGraphRelationBody): Promise<GraphRelation>;
  deleteRelation(relationId: string): Promise<void>;
  generateGraph(recordType: string, recordId: string, query?: GenerateGraphQuery): Promise<GraphData>;
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
    generateGraph: async (recordType, recordId, query = {}) => {
      const graph = await marbleCoreApiClient.generateRelationshipGraph(recordType, recordId, query);
      return adaptGraphData(graph);
    },
  });
}
