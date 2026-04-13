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
type LinkAddChange = Extract<LinkChange, { operation: 'ADD' }>;
type LinkDelChange = Extract<LinkChange, { operation: 'DEL' }>;

export function adaptUpdateTableValue(
  tableState: SemanticTableFormValues,
  changeSet: ChangeRecord[],
  originalFields: TableField[],
  originalLinks: LinkValue[],
  tableNameById: Map<string, string>,
): EditSemanticTablePayload {
  const tableChange = changeSet.find((change): change is TableChange => change.type === 'table');
  const changedProperties = tableChange?.changedProperties ?? [];

  const currentFieldOrder = tableState.fields.map((f) => f.name).join(',');
  const originalFieldOrder = originalFields.map((f) => f.name).join(',');
  const fieldOrderChanged = currentFieldOrder !== originalFieldOrder;

  const newLinkValues = changeSet
    .filter((c): c is LinkAddChange => c.type === 'link' && c.operation === 'ADD')
    .flatMap((c) => tableState.links.find((l) => l.name === c.objectName) ?? []);

  const deletedLinkValues = changeSet
    .filter((c): c is LinkDelChange => c.type === 'link' && c.operation === 'DEL')
    .flatMap((c) => {
      const link = originalLinks.find((l) => l.linkId === c.objectId);
      if (!link) return [];
      const stillUsed = tableState.links.some((l) => l.tableFieldId === link.tableFieldId);
      return stillUsed ? [] : [link];
    });

  const adaptedTable: EditSemanticTablePayload = {
    tableId: tableState.tableId,
    ...(changedProperties.includes('alias') ? { alias: tableState.alias } : {}),
    ...(changedProperties.includes('entityType')
      ? { semantic_type: tableState.entityType === 'unset' ? 'other' : tableState.entityType }
      : {}),
    ...(changedProperties.includes('mainTimestampFieldName')
      ? { primary_ordering_field: tableState.mainTimestampFieldName }
      : {}),
    fields: adaptFieldsOperations(
      changeSet.filter((change) => change.type === 'field'),
      tableState.fields,
      originalFields,
      newLinkValues,
      deletedLinkValues,
      tableNameById,
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
      if (change.operation === 'MOD' && change.objectId === link.linkId) return true;
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
  newLinkValues: LinkValue[] = [],
  deletedLinkValues: LinkValue[] = [],
  tableNameById: Map<string, string> = new Map(),
): EditSemanticFieldPayload[] | undefined {
  const originalFieldsById = new Map(originalFields.map((f) => [f.id, f]));
  const fieldOps: EditSemanticTablePayload['fields'] = [];
  const processedFieldNames = new Set<string>();

  for (const change of changeSet) {
    if (change.operation === 'DEL') {
      fieldOps.push({ op: 'DEL', data: { id: change.objectId } });
      continue;
    }
    const fieldValues = fields.find((field) =>
      change.operation === 'ADD' ? change.objectName === field.name : change.objectId === field.id,
    );
    if (fieldValues) {
      const fkLink = newLinkValues.find((l) => l.tableFieldId === fieldValues.name);
      const effectiveField = fkLink
        ? {
            ...fieldValues,
            semanticType: 'foreign_key' as const,
            foreignkeyTable: tableNameById.get(fkLink.targetTableId),
          }
        : fieldValues;
      fieldOps.push(adaptFieldOperation(change, effectiveField, originalFieldsById.get(effectiveField.id)));
      processedFieldNames.add(fieldValues.name);
    }
  }

  // Inject MOD for fields referenced by a new link but not already in the changeSet
  for (const link of newLinkValues) {
    if (processedFieldNames.has(link.tableFieldId)) continue;
    const field = fields.find((f) => f.name === link.tableFieldId);
    if (!field) continue;
    const fkField = {
      ...field,
      semanticType: 'foreign_key' as const,
      foreignkeyTable: tableNameById.get(link.targetTableId),
    };
    fieldOps.push(
      adaptFieldOperation(
        { type: 'field', operation: 'MOD', objectId: field.id },
        fkField,
        originalFieldsById.get(field.id),
      ),
    );
    processedFieldNames.add(link.tableFieldId);
  }

  // Inject MOD to revert fields whose link was deleted (already filtered to fields not still used by another link)
  for (const deletedLink of deletedLinkValues) {
    if (processedFieldNames.has(deletedLink.tableFieldId)) continue;
    const field = fields.find((f) => f.name === deletedLink.tableFieldId);
    if (!field) continue;
    const revertedField = { ...field, semanticType: 'text' as const, foreignkeyTable: undefined };
    fieldOps.push(
      adaptFieldOperation(
        { type: 'field', operation: 'MOD', objectId: field.id },
        revertedField,
        originalFieldsById.get(field.id),
      ),
    );
    processedFieldNames.add(deletedLink.tableFieldId);
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
  'foreignkeyTable',
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
    is_enum:
      current.semanticType === 'enum' ? ifChanged(true, original.isEnum) : ifChanged(current.isEnum, original.isEnum),
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
          foreignkeyTable: current.foreignkeyTable,
          hidden: current.hidden,
        }
      : undefined,
  });
}
