import { undefinedAstNodeName, type Validation } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Select } from '@ui-design-system';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { getBorderColor } from '../utils';

//TOOD(builder): move the whitelist of operators to the backend
const operatorFunctions = [
  undefinedAstNodeName,
  '+',
  '-',
  '<',
  '=',
  '>',
  '*',
  '/',
  'IsInList',
] as const;
type OperatorFunctions = (typeof operatorFunctions)[number];

function isOperatorFunctions(value: string): value is OperatorFunctions {
  return (operatorFunctions as ReadonlyArray<string>).includes(value);
}

export interface OperatorViewModel {
  nodeId: string;
  funcName: OperatorFunctions;
  validation: Validation;
}

export function adaptOperatorViewModel(
  vm: EditorNodeViewModel
): OperatorViewModel | null {
  if (vm.funcName == null || !isOperatorFunctions(vm.funcName)) return null;
  return {
    nodeId: vm.nodeId,
    funcName: vm.funcName,
    validation: vm.validation,
  };
}

export function Operator({
  builder,
  operatorViewModel,
  onSave,
  viewOnly,
}: {
  builder: AstBuilder;
  operatorViewModel: OperatorViewModel;
  onSave: (operator: string) => void;
  viewOnly?: boolean;
}) {
  const getOperatorName = useGetOperatorName();

  // We treat undefinedAstNodeName as "no value" to display the placeholder
  const value =
    operatorViewModel.funcName !== undefinedAstNodeName
      ? operatorViewModel.funcName
      : undefined;

  return (
    <Select.Root value={value} onValueChange={onSave} disabled={viewOnly}>
      <Select.Trigger
        borderColor={getBorderColor(operatorViewModel.validation)}
      >
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {builder.operators.map((operator) => {
            return (
              <Select.Item
                className="min-w-[110px]"
                key={operator.name}
                value={operator.name}
              >
                <Select.ItemText>
                  <span className="text-s text-grey-100 font-semibold">
                    {getOperatorName(operator.name)}
                  </span>
                </Select.ItemText>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}

export function useGetOperatorName() {
  const { t } = useTranslation(['scenarios']);

  return useCallback(
    (operatorName: string) => {
      if (['+', '-', '<', '=', '>'].includes(operatorName)) return operatorName;

      if (operatorName === '*') return '×';
      if (operatorName === '/') return '÷';

      if (operatorName === 'IsInList') return t('scenarios:operator.is_in');

      // eslint-disable-next-line no-restricted-properties
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled operator', operatorName);
      }
      return operatorName;
    },
    [t]
  );
}
