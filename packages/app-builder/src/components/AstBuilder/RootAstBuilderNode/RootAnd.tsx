import { LogicalOperatorLabel } from '@app-builder/components/Scenario/LogicalOperator';
import { NewUndefinedAstNode, type Validation } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';
import { RemoveButton } from './RemoveButton';

export interface RootAndViewModel {
  nodeId: string;
  validation: Validation;
  children: EditorNodeViewModel[];
}

export function adaptRootAndViewModel(
  viewModel: EditorNodeViewModel
): RootAndViewModel | null {
  if (viewModel.funcName !== 'And') {
    return null;
  }
  return {
    nodeId: viewModel.nodeId,
    validation: viewModel.validation,
    children: viewModel.children,
  };
}

function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

export function RootAnd({
  builder,
  rootAndViewModel,
  viewOnly,
}: {
  builder: AstBuilder;
  rootAndViewModel: RootAndViewModel;
  viewOnly?: boolean;
}) {
  function appendAndChild() {
    builder.appendChild(rootAndViewModel.nodeId, NewAndChild());
  }

  return (
    <div className="flex flex-col gap-2">
      {rootAndViewModel.children.map((child, childIndex) => {
        return (
          <div
            key={child.nodeId}
            className="flex flex-row-reverse items-center gap-2"
          >
            {!viewOnly && (
              <RemoveButton
                className="peer"
                onClick={() => {
                  builder.remove(child.nodeId);
                }}
              />
            )}
            <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1 transition-colors duration-200 ease-in-out">
              <AstBuilderNode
                builder={builder}
                editorNodeViewModel={child}
                viewOnly={viewOnly}
              />
            </div>
            <LogicalOperatorLabel
              operator={childIndex === 0 ? 'where' : 'and'}
            />
          </div>
        );
      })}

      {!viewOnly && (
        <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
      )}
    </div>
  );
}
