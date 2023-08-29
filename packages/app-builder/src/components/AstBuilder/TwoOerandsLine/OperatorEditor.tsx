import { useGetOperatorName } from '@app-builder/services/editor';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Select } from '@ui-design-system';

const operatorEditorFunctions = ['or', 'and'] as const;
type OperatorEditorFunctions = (typeof operatorEditorFunctions)[number];

function isOperatorEditorFunctions(
  value: string
): value is OperatorEditorFunctions {
  return value in operatorEditorFunctions;
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
      onValueChange={(selectedId) => {
        builder.setOperator(operatorEditorViewModel.nodeId, selectedId);
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
