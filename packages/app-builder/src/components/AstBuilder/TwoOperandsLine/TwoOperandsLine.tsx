import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { ErrorMessage } from '../ErrorMessage';
import { Operand, type OperandViewModel } from '../Operand';
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
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2">
        <Operand
          builder={builder}
          operandViewModel={twoOperandsViewModel.left}
          onSave={(astNode) => {
            builder.setOperand(twoOperandsViewModel.left.nodeId, astNode);
          }}
        />
        <Operator
          builder={builder}
          operatorViewModel={twoOperandsViewModel.operator}
          onSave={(operator) => {
            builder.setOperator(twoOperandsViewModel.operator.nodeId, operator);
          }}
        />
        <Operand
          builder={builder}
          operandViewModel={twoOperandsViewModel.right}
          onSave={(astNode) => {
            builder.setOperand(twoOperandsViewModel.right.nodeId, astNode);
          }}
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
