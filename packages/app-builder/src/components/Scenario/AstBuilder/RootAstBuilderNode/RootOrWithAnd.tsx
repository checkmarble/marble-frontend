import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  type AstNode,
  NewAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { type RootOrWithAndAstNodeViewModel } from '@app-builder/models/ast-node-view-model';
import {
  adaptBooleanReturnValue,
  useDisplayReturnValues,
} from '@app-builder/services/editor/return-value';
import { useRootAstBuilderValidation } from '@app-builder/services/validation/ast-node-validation';
import clsx from 'clsx';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

import { EvaluationErrors } from '../../ScenarioValidationError';
import { AstBuilderNode } from '../AstBuilderNode/AstBuilderNode';
import { RemoveButton } from '../RemoveButton';
import { AddLogicalOperatorButton } from './AddLogicalOperatorButton';

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
  astNodeVM: RootOrWithAndAstNodeViewModel;
  viewOnly?: boolean;
}) {
  const { t } = useTranslation(['common']);
  const { getOrAndErrorMessages, getOrAndChildValidation } =
    useRootAstBuilderValidation();

  function appendOrChild() {
    appendChild(astNodeVM.nodeId, NewOrChild());
  }

  const orErrorMessages = getOrAndErrorMessages(astNodeVM);

  const [displayReturnValues] = useDisplayReturnValues();

  return (
    <div className="grid grid-cols-[40px_1fr_max-content] gap-2">
      {astNodeVM.children.map((andChild, childIndex) => {
        const isFirstChild = childIndex === 0;

        const andErrorMessages = getOrAndErrorMessages(andChild);

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
                  className="uppercase"
                  type="contained"
                />
                <div className="col-span-2 flex flex-1 items-center">
                  <div className="bg-grey-10 h-px w-full" />
                </div>
              </>
            ) : null}

            {andChild.children.map((child, childIndex) => {
              const { errorMessages, hasArgumentIndexErrorsFromParent } =
                getOrAndChildValidation(child);

              const childBooleanReturnValue = adaptBooleanReturnValue(
                child.returnValue,
              );

              let rightComponent = null;
              if (!viewOnly) {
                rightComponent = (
                  <div className="flex h-10 items-center justify-center">
                    <RemoveButton
                      onClick={() => {
                        removeAndChild(child.nodeId);
                      }}
                    />
                  </div>
                );
              } else if (displayReturnValues && childBooleanReturnValue) {
                rightComponent = (
                  <div className="flex h-10 items-center justify-center">
                    <Tag
                      border="square"
                      className="w-full"
                      color={childBooleanReturnValue.value ? 'green' : 'red'}
                    >
                      {t(`common:${childBooleanReturnValue.value}`)}
                    </Tag>
                  </div>
                );
              }

              return (
                // AND operand row
                <Fragment key={child.nodeId}>
                  <LogicalOperatorLabel
                    operator={childIndex === 0 ? 'if' : 'and'}
                    type="text"
                    validationStatus={
                      hasArgumentIndexErrorsFromParent ? 'error' : 'valid'
                    }
                  />
                  <div
                    className={clsx(
                      'flex flex-col gap-2',
                      rightComponent === null && 'col-span-2',
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
                  {rightComponent}
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
