import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { ErrorMessage } from '../ErrorMessage';
import { OperandEditor, type OperandViewModel } from './OperandEditor';
import {
  adaptOperatorEditorViewModel,
  OperatorEditor,
  type OperatorEditorViewModel,
} from './OperatorEditor';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: OperatorEditorViewModel;
  right: OperandViewModel;
}

export function TwoOperandsLine({
  builder,
  twoOperandsViewModel,
}: {
  builder: AstBuilder;
  twoOperandsViewModel: TwoOperandsLineViewModel;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-1">
        <OperandEditor
          builder={builder}
          operandViewModel={twoOperandsViewModel.left}
        />
        <OperatorEditor
          builder={builder}
          operatorEditorViewModel={twoOperandsViewModel.operator}
        />
        <OperandEditor
          builder={builder}
          operandViewModel={twoOperandsViewModel.right}
        />
      </div>
      {twoOperandsViewModel.operator.validation.state === 'fail' && (
        <ErrorMessage
          errors={twoOperandsViewModel.operator.validation.errors}
        />
      )}
    </div>
  );
}

export function adaptTwoOperandsLineViewModel(
  vm: EditorNodeViewModel
): TwoOperandsLineViewModel | null {
  if (vm.children.length !== 2) return null;
  if (Object.keys(vm.namedChildren).length > 0) return null;

  const operatorVm = adaptOperatorEditorViewModel(vm);
  if (operatorVm == null) return null;

  const left = vm.children[0];
  const right = vm.children[1];
  return {
    left,
    operator: operatorVm,
    right,
  };
}
