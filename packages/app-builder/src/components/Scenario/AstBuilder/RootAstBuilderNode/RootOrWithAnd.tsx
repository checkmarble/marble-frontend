import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  type AstNode,
  type DatabaseAccessAstNode,
  NewAstNode,
  NewUndefinedAstNode,
  type PayloadAstNode,
  type TableModel,
} from '@app-builder/models';
import { type OperatorFunctions } from '@app-builder/models/editable-operators';
import {
  type EvaluationError,
  separateChildrenErrors,
} from '@app-builder/models/node-evaluation';
import {
  type EditorNodeViewModel,
  findArgumentIndexErrorsFromParent,
  hasArgumentIndexErrorsFromParent,
} from '@app-builder/services/editor/ast-editor';
import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
  useGetOrAndNodeEvaluationErrorMessage,
} from '@app-builder/services/validation';
import clsx from 'clsx';
import { type CustomList } from 'marble-api';
import { Fragment } from 'react';

import { EvaluationErrors } from '../../ScenarioValidationError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { computeLineErrors } from '../AstBuilderNode/TwoOperandsLine';
import { RemoveButton } from '../RemoveButton';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';

export interface RootOrWithAndViewModel {
  orNodeId: string;
  orErrors: EvaluationError[];
  ands: {
    nodeId: string;
    errors: EvaluationError[];
    children: EditorNodeViewModel[];
  }[];
}

export function adaptRootOrWithAndViewModel(
  viewModel: EditorNodeViewModel,
): RootOrWithAndViewModel | null {
  if (viewModel.funcName !== 'Or') {
    return null;
  }
  for (const child of viewModel.children) {
    if (child.funcName !== 'And') {
      return null;
    }
  }
  return {
    orNodeId: viewModel.nodeId,
    orErrors: viewModel.errors,
    ands: viewModel.children.map((andNode) => ({
      nodeId: andNode.nodeId,
      errors: andNode.errors,
      children: andNode.children,
    })),
  };
}

function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

function NewOrChild() {
  return NewAstNode({
    name: 'And',
    children: [NewAndChild()],
  });
}

export function RootOrWithAnd({
  input,
  setOperand,
  setOperator,
  appendChild,
  remove,
  rootOrWithAndViewModel,
  viewOnly,
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
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  rootOrWithAndViewModel: RootOrWithAndViewModel;
  viewOnly?: boolean;
}) {
  const getOrAndNodeEvaluationErrorMessage =
    useGetOrAndNodeEvaluationErrorMessage();
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  function appendOrChild() {
    appendChild(rootOrWithAndViewModel.orNodeId, NewOrChild());
  }

  const { nodeErrors: orNodeErrors } = separateChildrenErrors(
    rootOrWithAndViewModel.orErrors,
  );
  const orErrorMessages = adaptEvaluationErrorViewModels(orNodeErrors).map(
    getOrAndNodeEvaluationErrorMessage,
  );

  return (
    <div className="grid grid-cols-[40px_1fr_30px] gap-2">
      {rootOrWithAndViewModel.ands.map((andChild, childIndex) => {
        const isFirstChild = childIndex === 0;
        const { nodeErrors: andNodeErrors } = separateChildrenErrors(
          andChild.errors,
        );

        const andErrorMessages = adaptEvaluationErrorViewModels(
          andNodeErrors,
        ).map(getOrAndNodeEvaluationErrorMessage);

        function appendAndChild() {
          appendChild(andChild.nodeId, NewAndChild());
        }

        // if this is the last and child, remove the and from or operands
        function removeAndChild(nodeId: string) {
          remove(andChild.children.length > 1 ? nodeId : andChild.nodeId);
        }

        return (
          <Fragment key={andChild.nodeId}>
            {/* OR separator row */}
            {!isFirstChild ? (
              <>
                <LogicalOperatorLabel
                  operator="or"
                  className="bg-grey-02 text-grey-25 uppercase"
                />
                <div className="col-span-2 flex flex-1 items-center">
                  <div className="bg-grey-10 h-px w-full" />
                </div>
              </>
            ) : null}

            {andChild.children.map((child, childIndex) => {
              const errorMessages = adaptEvaluationErrorViewModels([
                ...computeLineErrors(child),
                ...findArgumentIndexErrorsFromParent(child),
              ]).map(getNodeEvaluationErrorMessage);

              return (
                // AND operand row
                <Fragment key={child.nodeId}>
                  <LogicalOperatorLabel
                    operator={childIndex === 0 ? 'if' : 'and'}
                    className={
                      hasArgumentIndexErrorsFromParent(child)
                        ? 'border border-red-100 text-red-100'
                        : 'text-grey-25 border border-transparent'
                    }
                  />
                  <div
                    className={clsx(
                      'flex flex-col gap-2',
                      viewOnly ? 'col-span-2' : 'col-span-1',
                    )}
                  >
                    <AstBuilderNode
                      input={input}
                      setOperand={setOperand}
                      setOperator={setOperator}
                      editorNodeViewModel={child}
                      viewOnly={viewOnly}
                      root
                    />
                    <EvaluationErrors errors={errorMessages} />
                  </div>
                  {!viewOnly ? (
                    <div className="flex h-10 flex-col items-center justify-center">
                      <RemoveButton
                        onClick={() => {
                          removeAndChild(child.nodeId);
                        }}
                      />
                    </div>
                  ) : null}
                </Fragment>
              );
            })}

            {/* [+ Condition] row */}
            {viewOnly ? (
              <EvaluationErrors
                errors={andErrorMessages}
                className="col-span-2 col-start-2"
              />
            ) : (
              <div className="col-span-2 col-start-2 flex flex-row flex-wrap gap-2">
                <AddLogicalOperatorButton
                  onClick={appendAndChild}
                  operator="and"
                />
                <EvaluationErrors errors={andErrorMessages} />
              </div>
            )}
          </Fragment>
        );
      })}

      {/* [+ Group] row */}
      {viewOnly ? (
        <EvaluationErrors errors={orErrorMessages} className="col-span-3" />
      ) : (
        <div className="col-span-3 flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendOrChild} operator="or" />
          <EvaluationErrors errors={orErrorMessages} />
        </div>
      )}
    </div>
  );
}
