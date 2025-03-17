import { type NonOmittedReturnValue, type ReturnValue } from '@app-builder/models/node-evaluation';
import { formatConstant } from '@app-builder/services/ast-node/formatConstant';
import { type TFunction } from 'i18next';

export function formatReturnValue(
  returnValue: ReturnValue | undefined,
  config: {
    t: TFunction<['common', 'scenarios'], undefined>;
    language: string;
  },
) {
  if (returnValue?.isOmitted === false) {
    return formatConstant(returnValue.value, config);
  }
  return undefined;
}

export function adaptBooleanOrNullReturnValue(returnValue: NonOmittedReturnValue) {
  if (typeof returnValue.value === 'boolean' || returnValue.value === null) {
    return { value: returnValue.value, isBooleanOrNull: true as const };
  }
  return { isBooleanOrNull: false as const };
}
