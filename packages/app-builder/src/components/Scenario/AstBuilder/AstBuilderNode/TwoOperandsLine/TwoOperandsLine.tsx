import { ScenarioValidatioError } from '@app-builder/components/Scenario/ScenarioValidatioError';
import { type EvaluationError, isValidationFailure } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
  flattenViewModelErrors,
} from '@app-builder/services/editor/ast-editor';
import { useGetNodeEvaluationErrorMessage } from '@app-builder/services/validation';

import { Operand, type OperandViewModel } from '../Operand';
import {
  adaptOperatorViewModel,
  Operator,
  type OperatorViewModel,
} from '../Operator';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: OperatorViewModel;
  right: OperandViewModel;
  errors: EvaluationError[];
}

export function TwoOperandsLine({
  builder,
  twoOperandsViewModel,
  viewOnly,
}: {
  builder: AstBuilder;
  twoOperandsViewModel: TwoOperandsLineViewModel;
  viewOnly?: boolean;
}) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Operand
          ariaLabel="left-operand"
          builder={builder}
          operandViewModel={twoOperandsViewModel.left}
          onSave={(astNode) => {
            builder.setOperand(twoOperandsViewModel.left.nodeId, astNode);
          }}
          viewOnly={viewOnly}
        />
        <Operator
          builder={builder}
          operatorViewModel={twoOperandsViewModel.operator}
          onSave={(operator) => {
            builder.setOperator(twoOperandsViewModel.operator.nodeId, operator);
          }}
          viewOnly={viewOnly}
        />
        <Operand
          ariaLabel="right-operand"
          builder={builder}
          operandViewModel={twoOperandsViewModel.right}
          onSave={(astNode) => {
            builder.setOperand(twoOperandsViewModel.right.nodeId, astNode);
          }}
          viewOnly={viewOnly}
        />
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {twoOperandsViewModel.errors.map((error, index) => (
          <ScenarioValidatioError key={index}>
            {getNodeEvaluationErrorMessage(error)}
          </ScenarioValidatioError>
        ))}
      </div>
    </div>
  );
}

export function adaptTwoOperandsLineViewModel(
  vm: EditorNodeViewModel
): TwoOperandsLineViewModel | null {
  if (vm.children.length !== 2) return null;
  if (Object.keys(vm.namedChildren).length > 0) return null;

  const indexedErrorsFromParent =
    vm.parent && isValidationFailure(vm.parent?.validation)
      ? vm.parent?.validation.errors.filter(
          (error) =>
            error.argumentIndex ==
            vm.parent?.children.findIndex((child) => child.nodeId == vm.nodeId)
        )
      : [];

  const operatorVm = adaptOperatorViewModel(vm);
  if (operatorVm == null) return null;

  const left = vm.children[0];
  const right = vm.children[1];
  return {
    left,
    operator: operatorVm,
    right,
    errors: [...flattenViewModelErrors(vm), ...indexedErrorsFromParent],
  };
}
