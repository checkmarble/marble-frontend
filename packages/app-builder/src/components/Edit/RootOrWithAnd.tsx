import {
  type AstNode,
  NewAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { Button, type ButtonProps } from '@ui-design-system';
import { Plus } from '@ui-icons';
import clsx from 'clsx';
import * as React from 'react';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormField, FormItem, FormMessage } from '../Form';
import { LogicalOperatorLabel } from '../Scenario/LogicalOperator';
import { RemoveButton } from './RemoveButton';

type RootOrWithAndFormFields = {
  astNode: AstNode;
};

const AddLogicalOperatorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    operator: 'and' | 'or';
  }
>(({ className, operator, ...props }, ref) => {
  const { t } = useTranslation(['scenarios']);

  return (
    <Button
      className={clsx(
        'text-grey-25 h-fit w-fit border-none ',
        'hover:bg-purple-10 hover:text-purple-100',
        className
      )}
      {...props}
      ref={ref}
    >
      <Plus className="text-m" />
      {t(`scenarios:logical_operator.${operator}_button`)}
    </Button>
  );
});
AddLogicalOperatorButton.displayName = 'AddLogicalOperatorButton';

function NewBinaryAstNode() {
  return NewUndefinedAstNode({
    children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
  });
}

export function RootOrOperator({
  renderAstNode,
}: {
  renderAstNode: (args: { name: string }) => React.ReactNode;
}) {
  const {
    fields: rootOrOperands,
    append,
    remove,
  } = useFieldArray<RootOrWithAndFormFields, 'astNode.children'>({
    name: 'astNode.children',
  });

  function appendOrOperand() {
    append(
      NewAstNode({
        name: 'And',
        children: [NewBinaryAstNode()],
      })
    );
  }

  return (
    <FormField
      name="astNode"
      render={() => {
        return (
          <FormItem className="flex flex-col gap-2">
            {rootOrOperands.map((operand, operandIndex) => {
              const isFirstOperand = operandIndex === 0;

              return (
                <React.Fragment key={operand.id}>
                  {!isFirstOperand && (
                    <div className="flex flex-row gap-1">
                      <LogicalOperatorLabel
                        operator="or"
                        className="bg-purple-10 uppercase"
                        color="purple"
                      />
                      <div className="flex flex-1 items-center">
                        <div className="bg-grey-10 h-[1px] w-full" />
                      </div>
                    </div>
                  )}
                  <RootAndOperator
                    isFirstGroupOperand={isFirstOperand}
                    name={`astNode.children.${operandIndex}`}
                    removeOrOperand={() => remove(operandIndex)}
                    renderAstNode={renderAstNode}
                  />
                </React.Fragment>
              );
            })}
            <FormMessage />
            <div className="my-1 flex flex-row items-center gap-1">
              <AddLogicalOperatorButton
                onClick={appendOrOperand}
                operator="or"
                variant="secondary"
              />
            </div>
          </FormItem>
        );
      }}
    />
  );
}

function RootAndOperator({
  isFirstGroupOperand = false,
  removeOrOperand,
  name,
  renderAstNode,
}: {
  isFirstGroupOperand: boolean;
  removeOrOperand: () => void;
  name: `astNode.children.${number}`;
  renderAstNode: (args: { name: string }) => React.ReactNode;
}) {
  const {
    fields: andOperands,
    remove,
    append,
  } = useFieldArray<RootOrWithAndFormFields, 'astNode.children'>({
    name: `${name}.children` as 'astNode.children',
  });

  function onRemoveClick(operandIndex: number) {
    // if this is the last and operand, remove the parent or operand instead
    andOperands.length > 1 ? remove(operandIndex) : removeOrOperand();
  }

  function appendAndOperand() {
    append(NewBinaryAstNode());
  }
  const isFirstConditionOperand =
    isFirstGroupOperand && andOperands.length === 0;

  return (
    <FormField
      name={name}
      render={() => {
        return (
          <FormItem>
            {andOperands.map((operand, operandIndex) => {
              return (
                <div
                  key={operand.id}
                  className="flex flex-row-reverse items-center gap-2"
                >
                  <RemoveButton
                    className="peer"
                    onClick={() => {
                      onRemoveClick(operandIndex);
                    }}
                  />
                  <div className="peer-hover:border-grey-25 flex flex-1 flex-col rounded border border-transparent p-1 transition-colors duration-200 ease-in-out">
                    {renderAstNode({
                      name: `${name}.children.${operandIndex}`,
                    })}
                  </div>
                  <LogicalOperatorLabel
                    operator={operandIndex === 0 ? 'if' : 'and'}
                  />
                </div>
              );
            })}
            <FormMessage />

            <div
              className={clsx('my-1', !isFirstConditionOperand && 'ml-[50px]')}
            >
              <AddLogicalOperatorButton
                variant="secondary"
                onClick={appendAndOperand}
                operator="and"
              />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
