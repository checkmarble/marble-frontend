import { LogicalOperatorLabel } from '@app-builder/components/Scenario/AstBuilder/RootAstBuilderNode/LogicalOperator';
import {
  type AndAstNode,
  type AstNode,
  NewAstNode,
  NewUndefinedAstNode,
  type OrWithAndAstNode,
} from '@app-builder/models';
import {
  useAstNodeEditorActions,
  useEvaluation,
  useRootOrAndChildValidation,
  useRootOrAndValidation,
} from '@app-builder/services/editor/ast-editor';
import {
  adaptBooleanReturnValue,
  useDisplayReturnValues,
} from '@app-builder/services/editor/return-value';
import { useChildrenArray } from '@app-builder/utils/tree';
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
  path,
  astNode,
  viewOnly,
}: {
  path: string;
  astNode: OrWithAndAstNode;
  viewOnly?: boolean;
}) {
  const { appendChild } = useAstNodeEditorActions();

  function appendOrChild() {
    appendChild(path, NewOrChild());
  }

  const astNodeChildren = useChildrenArray(path, astNode);

  const { errorMessages } = useRootOrAndValidation(path);

  return (
    <div className="grid grid-cols-[40px_1fr_max-content] gap-2">
      {astNodeChildren.map(({ child, key, path }, childIndex) => {
        const isFirstChild = childIndex === 0;

        return (
          <Fragment key={key}>
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

            <OrOperand path={path} andAstNode={child} viewOnly={viewOnly} />
          </Fragment>
        );
      })}

      {/* [+ Group] row */}
      {viewOnly ? (
        <EvaluationErrors errors={errorMessages} className="col-span-3" />
      ) : (
        <div className="col-span-3 flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendOrChild} operator="or" />
          <EvaluationErrors errors={errorMessages} />
        </div>
      )}
    </div>
  );
}

function OrOperand({
  path,
  andAstNode,
  viewOnly,
}: {
  path: string;
  andAstNode: AndAstNode;
  viewOnly?: boolean;
}) {
  const { remove, appendChild } = useAstNodeEditorActions();

  const { errorMessages } = useRootOrAndValidation(path);

  function removeAndOperand(stringPath: string) {
    // if this is the last and child, remove the and from or operands
    remove(andAstNode.children.length > 1 ? stringPath : path);
  }

  function appendAndChild() {
    appendChild(path, NewAndChild());
  }

  const andAstNodeChildren = useChildrenArray(path, andAstNode);

  return (
    <Fragment>
      {andAstNodeChildren.map(({ child, key, path }, childIndex) => (
        <AndOperand
          key={key}
          path={path}
          operator={childIndex === 0 ? 'if' : 'and'}
          astNode={child}
          remove={removeAndOperand}
          viewOnly={viewOnly}
        />
      ))}

      {/* [+ Condition] row */}
      {viewOnly ? (
        <EvaluationErrors
          errors={errorMessages}
          className="col-span-2 col-start-2"
        />
      ) : (
        <div className="col-span-2 col-start-2 flex flex-row flex-wrap gap-2">
          <AddLogicalOperatorButton onClick={appendAndChild} operator="and" />
          <EvaluationErrors errors={errorMessages} />
        </div>
      )}
    </Fragment>
  );
}

function AndOperand({
  path,
  operator,
  astNode,
  viewOnly,
  remove,
}: {
  path: string;
  operator: 'if' | 'and';
  astNode: AstNode;
  remove: (path: string) => void;
  viewOnly?: boolean;
}) {
  const { t } = useTranslation(['common']);
  const [displayReturnValues] = useDisplayReturnValues();
  const evaluation = useEvaluation(path);

  const { errorMessages, hasArgumentIndexErrorsFromParent } =
    useRootOrAndChildValidation(path);

  const childBooleanReturnValue = adaptBooleanReturnValue(
    evaluation?.returnValue,
  );

  let rightComponent = null;
  if (!viewOnly) {
    rightComponent = (
      <div className="flex h-10 items-center justify-center">
        <RemoveButton
          onClick={() => {
            remove(path);
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
    <Fragment>
      <LogicalOperatorLabel
        operator={operator}
        type="text"
        validationStatus={hasArgumentIndexErrorsFromParent ? 'error' : 'valid'}
      />
      <div
        className={clsx(
          'flex flex-col gap-2',
          rightComponent === null && 'col-span-2',
        )}
      >
        <AstBuilderNode
          path={path}
          astNode={astNode}
          viewOnly={viewOnly}
          root
        />
        <EvaluationErrors errors={errorMessages} />
      </div>
      {rightComponent}
    </Fragment>
  );
}
