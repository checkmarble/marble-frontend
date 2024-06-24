import { type ConstantType } from '@app-builder/models';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { type TFunction } from 'i18next';
import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { noop } from 'typescript-utils';

export type ReturnValue =
  | {
      value: ConstantType;
      isOmitted: false;
    }
  | {
      isOmitted: true;
    };

// This method is close to ConstantEditableAstNode.getConstantDisplayName
// We may need to refactor this method in the future
function formatConstantType(
  constant: ConstantType,
  config: {
    t: TFunction<['common', 'scenarios'], undefined>;
    language: string;
  },
): string {
  if (R.isNullish(constant)) return 'NULL';

  if (R.isArray(constant)) {
    return `[${constant.map((c) => formatConstantType(c, config)).join(', ')}]`;
  }

  if (R.isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return `"${constant.toString()}"`;
  }

  if (R.isBoolean(constant)) {
    return config.t(`common:${constant}`);
  }

  if (R.isNumber(constant)) {
    return formatNumber(constant, {
      language: config.language,
      maximumFractionDigits: 2,
    });
  }

  // Handle other cases when needed
  return JSON.stringify(
    R.mapValues(constant, (c) => formatConstantType(c, config)),
  );
}

export function formatReturnValue(
  returnValue: ReturnValue | undefined,
  config: {
    t: TFunction<['common', 'scenarios'], undefined>;
    language: string;
  },
) {
  if (returnValue?.isOmitted === false) {
    return formatConstantType(returnValue.value, config);
  }
  return undefined;
}

export function useFormatReturnValue() {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();

  return useCallback(
    (returnValue?: ReturnValue) =>
      formatReturnValue(returnValue, { t, language }),
    [t, language],
  );
}

const DisplayReturnValues = createContext<[boolean, (val: boolean) => void]>([
  false,
  noop,
]);
DisplayReturnValues.displayName = 'DisplayReturnValues';

export function DisplayReturnValuesProvider({
  children,
  initialDisplayReturnValues,
}: {
  children: React.ReactNode;
  initialDisplayReturnValues?: boolean;
}) {
  const value = useState(initialDisplayReturnValues ?? false);
  return (
    <DisplayReturnValues.Provider value={value}>
      {children}
    </DisplayReturnValues.Provider>
  );
}

export function useDisplayReturnValues() {
  return useContext(DisplayReturnValues);
}

export function adaptBooleanReturnValue(returnValue?: ReturnValue) {
  if (
    returnValue !== undefined &&
    returnValue.isOmitted === false &&
    typeof returnValue.value === 'boolean'
  ) {
    return { value: returnValue.value };
  }
  return undefined;
}
