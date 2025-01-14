import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  type AndAstNode,
  type AstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  useAstNodeEditorActions,
  useRootOrAndChildValidation,
  useRootOrAndValidation,
} from '@app-builder/services/editor/ast-editor';
import { useTriggerObjectTable } from '@app-builder/services/editor/options';
import { useChildrenArray } from '@app-builder/utils/tree';
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
  path,
  astNode,
  viewOnly,
}: {
  path: string;
  astNode: AndAstNode;
  viewOnly?: boolean;
}) {
  const { appendChild } = useAstNodeEditorActions();
  const triggerObjectTable = useTriggerObjectTable();

  const { errorMessages } = useRootOrAndValidation(path);

  function appendAndChild() {
    appendChild(path, NewAndChild());
  }

  const andAstNodeChildren = useChildrenArray(path, astNode);

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
        <div className="text-s bg-grey-98 text-purple-65 col-span-5 flex size-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 font-semibold">
          {triggerObjectTable.name}
        </div>
        {andAstNodeChildren.map(({ child, key, treePath }, childIndex) => {
          const isFirstCondition = childIndex === 0;
          const isLastCondition = childIndex === andAstNodeChildren.length - 1;

          return (
            <AndOperand
              key={key}
              isFirstCondition={isFirstCondition}
              isLastCondition={isLastCondition}
              treePath={treePath}
              astNode={child}
              viewOnly={viewOnly}
            />
          );
        })}
      </div>

      {viewOnly ? (
        <EvaluationErrors errors={errorMessages} />
      ) : (
        <div className="flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
          <EvaluationErrors errors={errorMessages} />
        </div>
      )}
    </>
  );
}

function AndOperand({
  isFirstCondition,
  isLastCondition,
  treePath,
  astNode,
  viewOnly,
}: {
  isFirstCondition: boolean;
  isLastCondition: boolean;
  treePath: string;
  astNode: AstNode;
  viewOnly?: boolean;
}) {
  const { remove } = useAstNodeEditorActions();

  const { errorMessages, hasArgumentIndexErrorsFromParent } =
    useRootOrAndChildValidation(treePath);

  return (
    <Fragment>
      {/* Row 1 */}
      <div
        className={clsx(
          'border-grey-90 col-span-5 w-2 border-e',
          isFirstCondition ? 'h-4' : 'h-2',
        )}
      />

      {/* Row 2 */}
      <div
        className={clsx(
          'border-grey-90 col-start-1 border-e',
          isLastCondition && 'h-5',
        )}
      />
      <div className="border-grey-90 col-start-2 h-5 border-b" />
      <LogicalOperatorLabel
        operator={isFirstCondition ? 'where' : 'and'}
        className="col-start-3"
        type="contained"
        validationStatus={hasArgumentIndexErrorsFromParent ? 'error' : 'valid'}
      />

      <div
        className={clsx(
          'col-start-4 flex flex-col gap-2 px-2',
          viewOnly ? 'col-span-2' : 'col-span-1',
        )}
      >
        <AstBuilderNode
          treePath={treePath}
          astNode={astNode}
          viewOnly={viewOnly}
          root
        />
        <EvaluationErrors errors={errorMessages} />
      </div>
      {!viewOnly ? (
        <div className="col-start-5 flex h-10 flex-col items-center justify-center">
          <RemoveButton
            onClick={() => {
              remove(treePath);
            }}
          />
        </div>
      ) : null}
    </Fragment>
  );
}
