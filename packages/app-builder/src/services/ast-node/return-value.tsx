import { type ConstantType } from '@app-builder/models';
import { createContext, useContext, useState } from 'react';
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
function formatConstantType(constant: ConstantType): string {
  if (R.isNil(constant)) return 'NULL';

  if (R.isArray(constant)) {
    return `[${constant.map(formatConstantType).join(', ')}]`;
  }

  if (R.isString(constant)) {
    //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
    return `"${constant.toString()}"`;
  }

  if (R.isNumber(constant) || R.isBoolean(constant)) {
    return constant.toString();
  }

  // Handle other cases when needed
  return JSON.stringify(R.mapValues(constant, formatConstantType));
}

export function formatReturnValue(returnValue?: ReturnValue) {
  if (returnValue?.isOmitted === false) {
    return formatConstantType(returnValue.value);
  }
  return undefined;
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
