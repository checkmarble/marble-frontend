import { ScenarioValidationError } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstBuilder,
  type EditorNodeViewModel,
  findArgumentIndexErrorsFromParent,
} from '@app-builder/services/editor/ast-editor';
import {
  adaptEvaluationErrorViewModels,
  type EvaluationErrorViewModel,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';

import {
  computeOperandErrors,
  Operand,
  type OperandViewModel,
} from '../Operand';
import {
  adaptOperatorViewModel,
  Operator,
  type OperatorViewModel,
} from '../Operator';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: OperatorViewModel;
  right: OperandViewModel;
  errors: EvaluationErrorViewModel[];
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

  const errorMessages = twoOperandsViewModel.errors.map((error) =>
    getNodeEvaluationErrorMessage(error)
  );

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
        {errorMessages.map((error) => (
          <ScenarioValidationError key={error}>{error}</ScenarioValidationError>
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

  const operatorVm = adaptOperatorViewModel(vm);
  if (operatorVm == null) return null;

  const left = vm.children[0];
  const right = vm.children[1];
  return {
    left,
    operator: operatorVm,
    right,
    errors: adaptEvaluationErrorViewModels([
      ...computeOperandErrors(left),
      ...vm.errors,
      ...computeOperandErrors(right),
      ...findArgumentIndexErrorsFromParent(vm),
    ]),
  };
}
