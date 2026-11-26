import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCreateGraphRelationDto,
  adaptGraphRelation,
  type CreateGraphRelationBody,
  type GraphRelation,
} from '@app-builder/models/graph';

export async function createRelation(api: MarbleCoreApi, body: CreateGraphRelationBody): Promise<GraphRelation> {
  const relation = await api.createGraphRelation(adaptCreateGraphRelationDto(body));
  return adaptGraphRelation(relation);
}
