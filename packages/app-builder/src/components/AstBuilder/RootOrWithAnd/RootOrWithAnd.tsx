import { LogicalOperatorLabel } from '@app-builder/components/Scenario/LogicalOperator';
import {
  NewAstNode,
  NewUndefinedAstNode,
  type Validation,
} from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Button, type ButtonProps } from '@ui-design-system';
import { Delete, Plus } from '@ui-icons';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AstBuilderNode } from '../AstBuilderNode';

export interface RootOrWithAndViewModel {
  orNodeId: string;
  orValidation: Validation;
  ands: {
    nodeId: string;
    validation: Validation;
    children: EditorNodeViewModel[];
  }[];
}

export function adaptRootOrWithAndViewModel(
  viewModel: EditorNodeViewModel
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
    orValidation: viewModel.validation,
    ands: viewModel.children.map((andNode) => ({
      nodeId: andNode.nodeId,
      validation: andNode.validation,
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
  builder,
  rootOrWithAndViewModel,
}: {
  builder: AstBuilder;
  rootOrWithAndViewModel: RootOrWithAndViewModel;
}) {
  return (
    <div className="flex flex-col gap-2">
      {rootOrWithAndViewModel.ands.map((andChild, childIndex) => {
        const isFirstChild = childIndex === 0;

        return (
          <React.Fragment key={andChild.nodeId}>
            {!isFirstChild && (
              <div className="flex flex-row gap-1">
                <LogicalOperatorLabel
                  operator="or"
                  className="bg-grey-02 uppercase"
                />
                <div className="flex flex-1 items-center">
                  <div className="bg-grey-10 h-[1px] w-full" />
                </div>
              </div>
            )}
            <RootAnd builder={builder} rootAndViewModel={andChild} />
          </React.Fragment>
        );
      })}
      <AddLogicalOperatorButton
        onClick={() => {
          builder.appendChild(rootOrWithAndViewModel.orNodeId, NewOrChild());
        }}
        operator="or"
      />
    </div>
  );
}

function RootAnd({
  builder,
  rootAndViewModel,
}: {
  builder: AstBuilder;
  rootAndViewModel: RootOrWithAndViewModel['ands'][0];
}) {
  function onRemoveClick(childNodeId: string) {
    // if this is the last and operand, remove the parent or operand instead
    builder.remove(
      rootAndViewModel.children.length > 1
        ? childNodeId
        : rootAndViewModel.nodeId
    );
  }

  function appendAndChild() {
    builder.appendChild(rootAndViewModel.nodeId, NewAndChild());
  }

  return (
    <>
      {rootAndViewModel.children.map((child, childIndex) => {
        return (
          <div
            key={child.nodeId}
            className="flex flex-row-reverse items-center gap-2"
          >
            <RemoveButton
              className="peer"
              onClick={() => {
                onRemoveClick(child.nodeId);
              }}
            />
            <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1 transition-colors duration-200 ease-in-out">
              <AstBuilderNode builder={builder} astNodeViewModel={child} />
            </div>
            <LogicalOperatorLabel operator={childIndex === 0 ? 'if' : 'and'} />
          </div>
        );
      })}

      <AddLogicalOperatorButton
        className="text-grey-25 h-fit w-fit text-xs"
        variant="secondary"
        onClick={appendAndChild}
        operator="and"
      />
    </>
  );
}

const AddLogicalOperatorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    operator: 'if' | 'and' | 'or' | 'where';
  }
>(({ className, operator, ...props }, ref) => {
  const { t } = useTranslation(['scenarios']);
  return (
    <Button className={clsx('w-fit uppercase', className)} {...props} ref={ref}>
      <Plus className="text-m" />
      {t(`scenarios:logical_operator.${operator}`)}
    </Button>
  );
});
AddLogicalOperatorButton.displayName = 'AddLogicalOperatorButton';

const RemoveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={clsx(
          'h-fit w-fit rounded-sm border p-1 text-xs transition-colors duration-200 ease-in-out',
          'bg-grey-00 text-grey-25 border-grey-10',
          'hover:text-grey-00 hover:border-red-100 hover:bg-red-100',
          'active:bg-red-110  active:border-red-110',
          className
        )}
        {...props}
        tabIndex={-1}
        ref={ref}
      >
        <Delete />
      </button>
    );
  }
);
RemoveButton.displayName = 'RemoveButton';
