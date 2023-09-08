import { type AstNode } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { ErrorMessage } from '../ErrorMessage';
import { OperandEditor, type OperandViewModel } from './OperandEditor';
import {
  adaptOperatorViewModel,
  Operator,
  type OperatorViewModel,
} from './Operator';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: OperatorViewModel;
  right: OperandViewModel;
}

export function TwoOperandsLine({
  builder,
  twoOperandsViewModel,
}: {
  builder: AstBuilder;
  twoOperandsViewModel: TwoOperandsLineViewModel;
}) {
  const onSaveOperand = (nodeId: string) => (astNode: AstNode) => {
    builder.setOperand(nodeId, astNode);
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2">
        <OperandEditor
          builder={builder}
          operandViewModel={twoOperandsViewModel.left}
          onSave={onSaveOperand(twoOperandsViewModel.left.nodeId)}
        />
        <Operator
          builder={builder}
          operatorViewModel={twoOperandsViewModel.operator}
        />
        <OperandEditor
          builder={builder}
          operandViewModel={twoOperandsViewModel.right}
          onSave={onSaveOperand(twoOperandsViewModel.right.nodeId)}
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

  const operatorVm = adaptOperatorViewModel(vm);
  if (operatorVm == null) return null;

  const left = vm.children[0];
  const right = vm.children[1];
  return {
    left,
    operator: operatorVm,
    right,
  };
}
