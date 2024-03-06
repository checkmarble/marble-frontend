import {
  type AstNode,
  type EvaluationError,
  functionNodeNames,
  NewUndefinedAstNode,
  separateChildrenErrors,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui-design-system';

import { AstBuilderNode } from '../AstBuilderNode';
import { type OperandViewModel } from '../Operand';
import {
  adaptOperatorViewModel,
  Operator,
  type OperatorViewModel,
} from '../Operator';

interface TwoOperandsLineViewModel {
  left: OperandViewModel;
  operator: OperatorViewModel;
  right: OperandViewModel;
}

function NewNestedChild(node: AstNode) {
  return NewUndefinedAstNode({
    children: [node, NewUndefinedAstNode()],
  });
}

export function TwoOperandsLine({
  builder,
  twoOperandsViewModel,
  viewOnly,
  root,
}: {
  builder: AstBuilder;
  twoOperandsViewModel: TwoOperandsLineViewModel;
  viewOnly?: boolean;
  root?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  function addNestedChild(child: EditorNodeViewModel) {
    builder.setOperand(
      child.nodeId,
      NewNestedChild(adaptAstNodeFromEditorViewModel(child)),
    );
  }

  function removeNestedChild(child: EditorNodeViewModel) {
    builder.setOperand(
      child.nodeId,
      adaptAstNodeFromEditorViewModel(child.children[0]),
    );
  }

  return (
    <div className="flex justify-between">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {!root ? <span className="text-grey-25">(</span> : null}
        <AstBuilderNode
          builder={builder}
          editorNodeViewModel={twoOperandsViewModel.left}
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
        <AstBuilderNode
          builder={builder}
          editorNodeViewModel={twoOperandsViewModel.right}
          onSave={(astNode) => {
            builder.setOperand(twoOperandsViewModel.right.nodeId, astNode);
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
