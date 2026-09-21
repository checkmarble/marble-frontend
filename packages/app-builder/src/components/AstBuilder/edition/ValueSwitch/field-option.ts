import type { DataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { getValueSwitchDimensionKey, type ValueSwitchDimension } from '@app-builder/models/astNode/value-switch';
import type { DataModelField, EnumValue } from '@app-builder/models/data-model';
import { isEnumField, resolveEnumValues } from '@app-builder/models/enum-values';
import { getDataAccessorDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';

/** Int/Float field (or already numeric bounds). Picks the threshold-band UI in the editor and hover preview. */
export function isNumericDimension(dimension: ValueSwitchDimension | null | undefined, field?: DataModelField) {
  if (dimension?.type !== 'field') return false;
  if (field) return field.dataType === 'Int' || field.dataType === 'Float';
  return dimension.values.length > 0 && dimension.values.every((value) => typeof value === 'number');
}

export function getValueSwitchFieldOption(
  accessor: DataAccessorAstNode,
  field: DataModelField,
  currentValues: EnumValue[] = [],
) {
  if (!['String', 'Int', 'Float'].includes(field.dataType)) return undefined;
  const resolved =
    field.dataType === 'String' && isEnumField(field) ? resolveEnumValues(field, currentValues) : undefined;
  const dimension = { type: 'field' as const, field: accessor };
  return {
    key: getValueSwitchDimensionKey(dimension),
    label: getDataAccessorDisplayName(accessor),
    dimension,
    field,
    closed: resolved?.closed,
    knownValues:
      field.dataType === 'String'
        ? (resolved?.values ?? field.values ?? []).filter((value): value is string => typeof value === 'string')
        : [],
  };
}
