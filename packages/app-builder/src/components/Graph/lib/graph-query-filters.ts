import { type DataModel } from '@app-builder/models/data-model';
import { type GraphRelation } from '@app-builder/models/graph';
import { type GenerateGraphPayload } from '@app-builder/schemas/graph';

export type GraphFilterOption = {
  value: string;
  label: string;
};

type GraphFilterParams = Pick<GenerateGraphPayload, 'types' | 'same_field_relations'>;

export function personTableNames(dataModel: DataModel) {
  return dataModel.filter((table) => table.semanticType === 'person').map((table) => table.name);
}

export function tableFilterOptions(dataModel: DataModel) {
  return dataModel
    .map((table) => ({ value: table.name, label: table.alias || table.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function relationGroupsFromRelations(relations: GraphRelation[]) {
  const groups = new Map<string, GraphFilterOption>();
  for (const relation of relations) {
    if (!groups.has(relation.groupId)) {
      groups.set(relation.groupId, { value: relation.groupId, label: relation.label });
    }
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function sortedJoin(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b)).join(',');
}

/**
 * A `null` relation selection means "every group", which the API expresses by omitting the
 * parameter. An empty array is the distinct "user cleared every group" case.
 */
export function toGenerateGraphFilterParams(input: {
  selectedTableNames: string[];
  selectedRelationGroupIds: string[] | null;
}): GraphFilterParams {
  const types = sortedJoin(input.selectedTableNames);
  if (input.selectedRelationGroupIds == null) return { types };
  return { types, same_field_relations: sortedJoin(input.selectedRelationGroupIds) };
}

export function graphFilterParamsEqual(left: GraphFilterParams, right: GraphFilterParams) {
  return left.types === right.types && left.same_field_relations === right.same_field_relations;
}
