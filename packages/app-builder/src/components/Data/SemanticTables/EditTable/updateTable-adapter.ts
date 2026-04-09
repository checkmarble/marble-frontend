import {
  EditSemanticFieldPayload,
  EditSemanticLinkPayload,
  EditSemanticTablePayload,
} from '@app-builder/queries/data/edit-semantic-table';
import { ifChanged, omitUndefined } from '@app-builder/utils/omit-undefined';
import { adaptLink, adaptSemanticField, adaptTableField } from '../CreateTable/createTable-types';
import { ChangeRecord, LinkValue, SemanticTableFormValues, TableField } from '../Shared/semanticData-types';

type TableChange = Extract<ChangeRecord, { type: 'table' }>;
type FieldChange = Extract<ChangeRecord, { type: 'field' }>;
type LinkChange = Extract<ChangeRecord, { type: 'link' }>;

export function adaptUpdateTableValue(
  tableState: SemanticTableFormValues,
  changeSet: ChangeRecord[],
  originalFields: TableField[],
): EditSemanticTablePayload {
  const tableChange = changeSet.find((change): change is TableChange => change.type === 'table');
  const changedProperties = tableChange?.changedProperties ?? [];

  const currentFieldOrder = tableState.fields.map((f) => f.name).join(',');
  const originalFieldOrder = originalFields.map((f) => f.name).join(',');
  const fieldOrderChanged = currentFieldOrder !== originalFieldOrder;

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
      originalFields,
    ),
    links: adaptLinksOperations(
      changeSet.filter((change) => change.type === 'link'),
      tableState.links,
    ),
    ...(fieldOrderChanged ? { metadata: { fieldOrder: currentFieldOrder } } : {}),
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

function adaptFieldsOperations(
  changeSet: FieldChange[],
  fields: TableField[],
  originalFields: TableField[],
): EditSemanticFieldPayload[] | undefined {
  const originalFieldsById = new Map(originalFields.map((f) => [f.id, f]));
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
      fieldOps.push(adaptFieldOperation(change, fieldValues, originalFieldsById.get(fieldValues.id)));
    }
  }
  return fieldOps.length > 0 ? fieldOps : undefined;
}

function adaptFieldOperation(
  change: FieldChange,
  fieldValues: TableField,
  originalField?: TableField,
): EditSemanticFieldPayload {
  if (change.operation === 'MOD')
    return {
      op: 'MOD',
      data: originalField
        ? adaptTableFieldUpdate(fieldValues, originalField)
        : { id: fieldValues.id, ...adaptTableField(fieldValues) },
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

const metadataKeys = [
  'semanticType',
  'semanticSubType',
  'currencyExponent',
  'decimalPrecision',
  'currencyFieldId',
  'hidden',
] as const satisfies (keyof TableField)[];

function adaptTableFieldUpdate(current: TableField, original: TableField) {
  const semanticTypeChanged =
    current.semanticType !== original.semanticType || current.semanticSubType !== original.semanticSubType;
  const metadataChanged = metadataKeys.some((k) => current[k] !== original[k]);

  return omitUndefined({
    id: current.id,
    description: ifChanged(current.description, original.description),
    alias: ifChanged(current.alias, original.alias),
    is_enum: ifChanged(current.isEnum, original.isEnum),
    is_nullable: ifChanged(current.nullable, original.nullable),
    is_unique: ifChanged(
      current.unicityConstraint === 'active_unique_constraint',
      original.unicityConstraint === 'active_unique_constraint',
    ),
    ftm_property: ifChanged(current.ftmProperty, original.ftmProperty),
    semantic_type: semanticTypeChanged ? adaptSemanticField(current.semanticType, current.semanticSubType) : undefined,
    metadata: metadataChanged
      ? {
          semanticTypeForFront: current.semanticType,
          semanticSubType: current.semanticSubType,
          currencyExponent: current.currencyExponent,
          decimalPrecision: current.decimalPrecision,
          currencyFieldId: current.currencyFieldId,
          hidden: current.hidden,
        }
      : undefined,
  });
}
