import {
  type AstNode,
  isFunctionAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  isTwoLineOperandOperatorFunction,
  type TwoLineOperandOperatorFunction,
} from '@app-builder/models/editable-operators';
import {
  type EvaluationError,
  separateChildrenErrors,
} from '@app-builder/models/node-evaluation';
import { useTwoLineOperandOperatorFunctions } from '@app-builder/services/ast-node/options';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { hasExactlyTwoElements } from '@app-builder/utils/array';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui-design-system';

import { AstBuilderNode } from './AstBuilderNode';
import { type OperandViewModel } from './Operand';
import { Operator } from './Operator';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: {
    nodeId: string;
    funcName: TwoLineOperandOperatorFunction;
    errors: EvaluationError[];
  };
  right: OperandViewModel;
}

function NewNestedChild(node: AstNode) {
  return NewUndefinedAstNode({
    children: [node, NewUndefinedAstNode()],
  });
}

export function TwoOperandsLine({
  setOperand,
  setOperator,
  twoOperandsViewModel,
  viewOnly,
  root,
}: {
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  twoOperandsViewModel: TwoOperandsLineViewModel;
  viewOnly?: boolean;
  root?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  function addNestedChild(child: EditorNodeViewModel) {
    setOperand(
      child.nodeId,
      NewNestedChild(adaptAstNodeFromEditorViewModel(child)),
    );
  }

  function removeNestedChild(child: EditorNodeViewModel) {
    const nestedChild = child.children[0];
    if (!nestedChild) return;
    setOperand(child.nodeId, adaptAstNodeFromEditorViewModel(nestedChild));
  }

  const operators = useTwoLineOperandOperatorFunctions();

  return (
    <div className="flex justify-between gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
        <AstBuilderNode
          setOperand={setOperand}
          setOperator={setOperator}
          editorNodeViewModel={twoOperandsViewModel.left}
          onSave={(astNode) => {
            setOperand(twoOperandsViewModel.left.nodeId, astNode);
          }}
          viewOnly={viewOnly}
        />
        <Operator
          value={twoOperandsViewModel.operator.funcName}
          setValue={(operator: (typeof operators)[number]) => {
            setOperator(twoOperandsViewModel.operator.nodeId, operator);
          }}
          errors={twoOperandsViewModel.operator.errors}
          viewOnly={viewOnly}
          operators={operators}
        />
        <AstBuilderNode
          setOperand={setOperand}
          setOperator={setOperator}
          editorNodeViewModel={twoOperandsViewModel.right}
          onSave={(astNode) => {
            setOperand(twoOperandsViewModel.right.nodeId, astNode);
          }}
          viewOnly={viewOnly}
        />
        {!root ? <span className="text-grey-25">)</span> : null}
      </div>
      {root && !viewOnly ? (
        <div className="flex h-10 items-center gap-2">
          <label className="text-s" htmlFor="nest">
            {t('scenarios:nest')}
          </label>
          <Switch
            id="nest"
            checked={isNested(twoOperandsViewModel)}
            onCheckedChange={(checked) =>
              checked
                ? addNestedChild(twoOperandsViewModel.right)
                : removeNestedChild(twoOperandsViewModel.right)
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export function adaptTwoOperandsLineViewModel(
  vm: EditorNodeViewModel,
): TwoOperandsLineViewModel | null {
  if (isFunctionAstNode(adaptAstNodeFromEditorViewModel(vm))) return null;

  if (!hasExactlyTwoElements(vm.children)) return null;
  if (Object.keys(vm.namedChildren).length > 0) return null;
  if (vm.funcName == null || !isTwoLineOperandOperatorFunction(vm.funcName))
    return null;

  const left = vm.children[0];
  const right = vm.children[1];
  return {
    left,
    operator: {
      nodeId: vm.nodeId,
      funcName: vm.funcName,
      errors: vm.errors,
    },
    right,
  };
}

function isNested(twoOperandsViewModel: TwoOperandsLineViewModel) {
  return adaptTwoOperandsLineViewModel(twoOperandsViewModel.right) !== null;
}

export const computeLineErrors = (
  viewModel: EditorNodeViewModel,
): EvaluationError[] => {
  const astNode = adaptAstNodeFromEditorViewModel(viewModel);
  if (isFunctionAstNode(astNode)) {
    const { nodeErrors } = separateChildrenErrors(viewModel.errors);
    return nodeErrors;
  } else {
    return [
      ...viewModel.errors,
      ...viewModel.children.flatMap(computeLineErrors),
      ...Object.values(viewModel.namedChildren).flatMap(computeLineErrors),
    ];
  }
};
