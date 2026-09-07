import type { DataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import { getValueSwitchDimensionKey } from '@app-builder/models/astNode/value-switch';
import type { DataModelField, EnumValue } from '@app-builder/models/data-model';
import { isEnumField, resolveEnumValues } from '@app-builder/models/enum-values';
import { getDataAccessorDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';

export function getValueSwitchFieldOption(
  accessor: DataAccessorAstNode,
  field: DataModelField,
  currentValues: EnumValue[] = [],
) {
  if (field.dataType !== 'String') return undefined;
  const resolved = isEnumField(field) ? resolveEnumValues(field, currentValues) : undefined;
  const dimension = { type: 'field' as const, field: accessor };
  return {
    key: getValueSwitchDimensionKey(dimension),
    label: getDataAccessorDisplayName(accessor),
    dimension,
    field,
    closed: resolved?.closed,
    knownValues: (resolved?.values ?? field.values ?? []).filter((value): value is string => typeof value === 'string'),
  };
}
