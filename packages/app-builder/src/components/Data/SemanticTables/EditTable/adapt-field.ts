import type { DataModelField } from '@app-builder/models';
import { inferSemanticTypeFromName } from '../../DataVisualisation/dataFieldsUtils';
import type { TableField } from '../Shared/semanticData-types';

export function adaptFieldToTableField(field: DataModelField): TableField {
  const isSystemField = field.name === 'object_id' || field.name === 'updated_at';
  const { semanticType: fallbackSemanticType, semanticSubType: fallbackSemanticSubType } = inferSemanticTypeFromName(
    field.name,
    field.dataType,
  );
  return {
    id: field.id,
    name: field.name,
    description: field.description,
    dataType: field.dataType as TableField['dataType'],
    tableId: field.tableId,
    isEnum: field.isEnum,
    nullable: field.nullable,
    alias: field.alias ?? field.name,
    hidden: field.hidden ?? false,
    unicityConstraint: field.unicityConstraint,
    ftmProperty: field.ftmProperty,
    semanticType:
      field.name === 'object_id'
        ? 'unique_id'
        : field.name === 'updated_at'
          ? 'last_update'
          : (field.semanticType ?? (field.isEnum ? 'enum' : fallbackSemanticType)),
    semanticSubType: field.name === 'object_id' ? 'opaque_id' : (field.semanticSubType ?? fallbackSemanticSubType),
    currencyExponent: field.currencyExponent,
    decimalPrecision: field.decimalPrecision,
    currencyFieldId: field.currencyFieldId,
    booleanDisplay: field.booleanDisplay,
    isInteger: field.isInteger,
    enumValues: field.enumValues,
    countryCodeFormat: field.countryCodeFormat,
    currencyCodeFormat: field.currencyCodeFormat,
    foreignkeyTable: field.foreignkeyTable,
    isNew: false,
    locked: isSystemField,
  };
}
