import {
  EditSemanticFieldPayload,
  EditSemanticLinkPayload,
  EditSemanticTablePayload,
} from '@app-builder/queries/data/edit-semantic-table';
import { adaptLink, adaptTableField } from '../CreateTable/createTable-types';
import { ChangeRecord, LinkValue, SemanticTableFormValues, TableField } from '../Shared/semanticData-types';

type TableChange = Extract<ChangeRecord, { type: 'table' }>;
type FieldChange = Extract<ChangeRecord, { type: 'field' }>;
type LinkChange = Extract<ChangeRecord, { type: 'link' }>;

export function adaptUpdateTableValue(
  tableState: SemanticTableFormValues,
  changeSet: ChangeRecord[],
): EditSemanticTablePayload {
  const tableChange = changeSet.find((change): change is TableChange => change.type === 'table');
  const changedProperties = tableChange?.changedProperties ?? [];

  const adaptedTable: EditSemanticTablePayload = {
    tableId: tableState.tableId,
    ...(changedProperties.includes('alias') ? { alias: tableState.alias } : {}),
    ...(changedProperties.includes('entityType') ? { semantic_type: tableState.entityType } : {}),
    ...(changedProperties.includes('mainTimestampFieldName')
      ? { primary_ordering_field: tableState.mainTimestampFieldName }
      : {}),
    fields: adaptFieldsOperations(
      changeSet.filter((change) => change.type === 'field'),
      tableState.fields,
    ),
    links: adaptLinksOperations(
      changeSet.filter((change) => change.type === 'link'),
      tableState.links,
    ),
  };
  return adaptedTable;
}

function adaptLinksOperations(changeSet: LinkChange[], links: LinkValue[]): EditSemanticLinkPayload[] | undefined {
  const linkOps: EditSemanticTablePayload['links'] = [];
  for (const change of changeSet) {
    if (change.operation === 'DEL') {
      linkOps.push({ op: 'DEL', data: { id: change.objectId } });
      continue;
    }
    const linkValues = links.find((link) => {
      if (change.operation === 'ADD' && change.objectName === link.name) return true;
      if (change.operation === 'MOD' && change.relationshipType === link.relationType) return true;
      return false;
    });
    if (linkValues) {
      linkOps.push(adaptLinkOperation(change, linkValues));
    }
  }
  return linkOps.length > 0 ? linkOps : undefined;
}

function adaptLinkOperation(change: LinkChange, linkValues: LinkValue): EditSemanticLinkPayload {
  if (change.operation === 'MOD')
    return {
      op: 'MOD',
      data: { id: linkValues.linkId, link_type: linkValues.relationType },
    };
  if (change.operation === 'DEL') return { op: 'DEL', data: { id: linkValues.linkId } };
  return { op: 'ADD', data: adaptLink(linkValues) };
}

function adaptFieldsOperations(changeSet: FieldChange[], fields: TableField[]): EditSemanticFieldPayload[] | undefined {
  const fieldOps: EditSemanticTablePayload['fields'] = [];
  for (const change of changeSet) {
    if (change.operation === 'DEL') {
      fieldOps.push({ op: 'DEL', data: { id: change.objectId } });
      continue;
    }
    const fieldValues = fields.find((field) =>
      change.operation === 'ADD' ? change.objectName === field.name : change.objectId === field.id,
    );
    if (fieldValues) {
      fieldOps.push(adaptFieldOperation(change, fieldValues));
    }
  }
  return fieldOps.length > 0 ? fieldOps : undefined;
}

function adaptFieldOperation(change: FieldChange, fieldValues: TableField): EditSemanticFieldPayload {
  if (change.operation === 'MOD')
    return {
      op: 'MOD',
      data: {
        id: fieldValues.id,
        ...adaptTableField(fieldValues),
      },
    };
  if (change.operation === 'DEL')
    return {
      op: 'DEL',
      data: { id: fieldValues.id },
    };
  return {
    op: 'ADD',
    data: adaptTableField(fieldValues),
  };
}
