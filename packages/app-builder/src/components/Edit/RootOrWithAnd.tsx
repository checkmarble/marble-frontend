import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
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
    append({
      name: 'And',
      children: [NewBinaryAstNode()],
      namedChildren: {},
      constant: null,
    });
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
                        className="bg-grey-02 uppercase"
                      />
                      <div className="flex flex-1 items-center">
                        <div className="bg-grey-10 h-[1px] w-full" />
                      </div>
                    </div>
                  )}
                  <RootAndOperator
                    name={`astNode.children.${operandIndex}`}
                    removeOrOperand={() => remove(operandIndex)}
                    renderAstNode={renderAstNode}
                  />
                </React.Fragment>
              );
            })}
            <FormMessage />
            <AddLogicalOperatorButton onClick={appendOrOperand} operator="or" />
          </FormItem>
        );
      }}
    />
  );
}

function RootAndOperator({
  removeOrOperand,
  name,
  renderAstNode,
}: {
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

            <AddLogicalOperatorButton
              className="text-grey-25 h-fit w-fit text-xs"
              variant="secondary"
              onClick={appendAndOperand}
              operator="and"
            />
          </FormItem>
        );
      }}
    />
  );
}
