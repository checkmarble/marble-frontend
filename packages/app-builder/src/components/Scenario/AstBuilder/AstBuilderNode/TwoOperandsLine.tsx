import {
  type AstNode,
  type DatabaseAccessAstNode,
  functionNodeNames,
  NewUndefinedAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import {
  isTwoLineOperandOperatorFunctions,
  type OperatorFunctions,
  type TwoLineOperandOperatorFunctions,
} from '@app-builder/models/editable-operators';
import {
  type EvaluationError,
  separateChildrenErrors,
} from '@app-builder/models/node-evaluation';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { type CustomList } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui-design-system';

import { AstBuilderNode } from './AstBuilderNode';
import { type OperandViewModel } from './Operand';
import { Operator } from './Operator';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: {
    nodeId: string;
    funcName: TwoLineOperandOperatorFunctions;
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
  input,
  setOperand,
  setOperator,
  twoOperandsViewModel,
  viewOnly,
  root,
}: {
  input: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    dataModel: TableModel[];
    customLists: CustomList[];
    triggerObjectTable: TableModel;
    operators: OperatorFunctions[];
  };
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
    setOperand(
      child.nodeId,
      adaptAstNodeFromEditorViewModel(child.children[0]),
    );
  }

  const operators = useMemo(
    () => input.operators.filter(isTwoLineOperandOperatorFunctions),
    [input.operators],
  );

  return (
    <div className="flex justify-between">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
        <AstBuilderNode
          input={input}
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
          setValue={(operator) => {
            setOperator(twoOperandsViewModel.operator.nodeId, operator);
          }}
          errors={twoOperandsViewModel.operator.errors}
          viewOnly={viewOnly}
          operators={operators}
        />
        <AstBuilderNode
          input={input}
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
            checked={twoOperandsViewModel.right.children.length === 2}
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
  if (vm.children.length !== 2) return null;
  if (Object.keys(vm.namedChildren).length > 0) return null;
  if (vm.funcName == null || !isTwoLineOperandOperatorFunctions(vm.funcName))
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

export const computeLineErrors = (
  viewModel: EditorNodeViewModel,
): EvaluationError[] => {
  if (viewModel.funcName && functionNodeNames.includes(viewModel.funcName)) {
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
