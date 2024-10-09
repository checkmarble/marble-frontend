import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type RootAndAstNodeViewModel } from '@app-builder/models/ast-node-view-model';
import { useTriggerObjectTable } from '@app-builder/services/editor/options';
import { useRootAstBuilderValidation } from '@app-builder/services/validation/ast-node-validation';
import clsx from 'clsx';
import { Fragment } from 'react';

import { EvaluationErrors } from '../../ScenarioValidationError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { RemoveButton } from '../RemoveButton';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';

function NewAndChild() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

/**
 * Design is opinionated: it assumes a RootAnd is used for trigger condition.
 */
export function RootAnd({
  setOperand,
  setOperator,
  appendChild,
  remove,
  astNodeVM,
  viewOnly,
}: {
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  astNodeVM: RootAndAstNodeViewModel;
  viewOnly?: boolean;
}) {
  const triggerObjectTable = useTriggerObjectTable();

  const { getOrAndErrorMessages, getOrAndChildValidation } =
    useRootAstBuilderValidation();

  const andErrorMessages = getOrAndErrorMessages(astNodeVM);

  function appendAndChild() {
    appendChild(astNodeVM.nodeId, NewAndChild());
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
    <>
      <div className="text-s grid grid-cols-[8px_16px_max-content_1fr_max-content]">
        <div className="text-s bg-grey-02 col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold text-purple-100">
          {triggerObjectTable.name}
        </div>
        {astNodeVM.children.map((child, childIndex) => {
          const isFirstCondition = childIndex === 0;
          const isLastCondition = childIndex === astNodeVM.children.length - 1;

          const { errorMessages, hasArgumentIndexErrorsFromParent } =
            getOrAndChildValidation(child);

          return (
            <Fragment key={`condition_${child.nodeId}`}>
              {/* Row 1 */}
              <div
                className={clsx(
                  'border-grey-10 col-span-5 w-2 border-r',
                  isFirstCondition ? 'h-4' : 'h-2',
                )}
              />

              {/* Row 2 */}
              <div
                className={clsx(
                  'border-grey-10 col-start-1 border-r',
                  isLastCondition && 'h-5',
                )}
              />
              <div className="border-grey-10 col-start-2 h-5 border-b" />
              <LogicalOperatorLabel
                operator={isFirstCondition ? 'where' : 'and'}
                className="col-start-3"
                type="contained"
                validationStatus={
                  hasArgumentIndexErrorsFromParent ? 'error' : 'valid'
                }
              />

              <div
                className={clsx(
                  'col-start-4 flex flex-col gap-2 px-2',
                  viewOnly ? 'col-span-2' : 'col-span-1',
                )}
              >
                <AstBuilderNode
                  setOperand={setOperand}
                  setOperator={setOperator}
                  astNodeVM={child}
                  viewOnly={viewOnly}
                  root
                />
                <EvaluationErrors errors={errorMessages} />
              </div>
              {!viewOnly ? (
                <div className="col-start-5 flex h-10 flex-col items-center justify-center">
                  <RemoveButton
                    onClick={() => {
                      remove(child.nodeId);
                    }}
                  />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {viewOnly ? (
        <EvaluationErrors errors={andErrorMessages} />
      ) : (
        <div className="flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
          <EvaluationErrors errors={andErrorMessages} />
        </div>
      )}
    </>
  );
}
