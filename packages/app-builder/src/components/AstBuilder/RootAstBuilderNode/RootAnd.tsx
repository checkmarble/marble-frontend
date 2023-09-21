import { LogicalOperatorLabel } from '@app-builder/components/Scenario/LogicalOperator';
import { ScenarioBox } from '@app-builder/components/Scenario/ScenarioBox';
import { NewUndefinedAstNode, type Validation } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';
import { Fragment } from 'react';

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

/**
 * Design is opinionated: it assumes a RootAnd is used for trigger condition.
 */
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

  /**
   * 1. Idea of the layout
   *
   *    Transaction
   *        |-> Where <Formula condition={condition.children[0]} />
   *        |-> And   <Formula condition={condition.children[1]} />
   *        |-> And   <Formula condition={condition.children[2]} />
   *        + And
   *
   * 2. Detail of the map
   *
   *  Row1: |
   *  Row2: |-> And   <Formula condition={condition.children[1]} />
   *
   */
  return (
    <div className="text-s grid grid-cols-[8px_16px_max-content_1fr]">
      <ScenarioBox className="bg-grey-02 col-span-4 w-fit p-2 font-semibold text-purple-100">
        {builder.triggerObjectType.name}
      </ScenarioBox>
      {rootAndViewModel.children.map((child, childIndex) => {
        const isFirstCondition = childIndex === 0;
        const isLastCondition =
          childIndex === rootAndViewModel.children.length - 1;

        return (
          <Fragment key={`condition_${child.nodeId}`}>
            {/* Row 1 */}
            <div
              className={clsx(
                'border-grey-10 col-span-4 w-2 border-r ',
                isFirstCondition ? 'h-4' : 'h-2'
              )}
            />

            {/* Row 2 */}
            <div
              className={clsx(
                'border-grey-10 border-r',
                isLastCondition && 'h-5'
              )}
            />
            <div className="border-grey-10 h-5 border-b" />
            <LogicalOperatorLabel
              className="bg-grey-02 mr-2 p-2"
              operator={isFirstCondition ? 'where' : 'and'}
            />

            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col">
                <AstBuilderNode
                  builder={builder}
                  editorNodeViewModel={child}
                  viewOnly={viewOnly}
                />
              </div>
              {!viewOnly && (
                <RemoveButton
                  className="peer"
                  onClick={() => {
                    builder.remove(child.nodeId);
                  }}
                />
              )}
            </div>
          </Fragment>
        );
      })}

      {!viewOnly && (
        <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
      )}
    </div>
  );
}
