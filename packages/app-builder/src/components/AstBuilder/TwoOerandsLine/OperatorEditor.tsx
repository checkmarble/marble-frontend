import { undefinedAstNodeName } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Select } from '@ui-design-system';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const operatorEditorFunctions = [
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
type OperatorEditorFunctions = (typeof operatorEditorFunctions)[number];

function isOperatorEditorFunctions(
  value: string
): value is OperatorEditorFunctions {
  return (operatorEditorFunctions as ReadonlyArray<string>).includes(value);
}

export interface OperatorEditorViewModel {
  nodeId: string;
  funcName: OperatorEditorFunctions;
}

export function adaptOperatorEditorViewModel(
  vm: EditorNodeViewModel
): OperatorEditorViewModel | null {
  if (vm.funcName == null || !isOperatorEditorFunctions(vm.funcName))
    return null;
  return {
    nodeId: vm.nodeId,
    funcName: vm.funcName,
  };
}

export function OperatorEditor({
  builder,
  operatorEditorViewModel,
}: {
  builder: AstBuilder;
  operatorEditorViewModel: OperatorEditorViewModel;
}) {
  const getOperatorName = useGetOperatorName();

  return (
    <Select.Root
      value={operatorEditorViewModel.funcName ?? undefined}
      onValueChange={(newFuncName) => {
        builder.setOperator(operatorEditorViewModel.nodeId, newFuncName);
      }}
    >
      <Select.Trigger className="focus:border-purple-100 aria-[invalid=true]:border-red-100">
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
