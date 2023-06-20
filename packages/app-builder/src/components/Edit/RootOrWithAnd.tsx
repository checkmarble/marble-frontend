import { type AstNode, NewAstNode } from '@app-builder/models';
import { Button, type ButtonProps } from '@ui-design-system';
import { Plus } from '@ui-icons';
import clsx from 'clsx';
import * as React from 'react';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { LogicalOperator } from '../Scenario/LogicalOperator';
import { RemoveButton } from './RemoveButton';

type RootOrWithAndFormFields = {
  astNode: AstNode;
};

const AddLogicalOperator = React.forwardRef<
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
AddLogicalOperator.displayName = 'AddLogicalOperator';

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
      name: 'AND',
      children: [NewAstNode()],
      namedChildren: {},
      constant: null,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {rootOrOperands.map((operand, operandIndex) => {
        const isFirstOperand = operandIndex === 0;

        return (
          <React.Fragment key={operand.id}>
            {!isFirstOperand && (
              <div className="flex flex-row gap-1">
                <LogicalOperator
                  operator="or"
                  className="bg-grey-02 uppercase"
                />
                <div className="flex flex-1 items-center">
                  <div className="bg-grey-10 h-[1px] w-full" />
                </div>
              </div>
            )}
            <RootAndOperator
              name={`astNode.children.${operandIndex}.children`}
              removeOrOperand={() => remove(operandIndex)}
              renderAstNode={renderAstNode}
            />
          </React.Fragment>
        );
      })}
      <AddLogicalOperator onClick={appendOrOperand} operator="or" />
    </div>
  );
}

function RootAndOperator({
  removeOrOperand,
  name,
  renderAstNode,
}: {
  removeOrOperand: () => void;
  name: `astNode.children.${number}.children`;
  renderAstNode: (args: { name: string }) => React.ReactNode;
}) {
  const {
    fields: andOperands,
    remove,
    append,
  } = useFieldArray<RootOrWithAndFormFields, 'astNode.children'>({
    name: name as 'astNode.children',
  });

  function onRemoveClick(operandIndex: number) {
    // if this is the last and operand, remove the parent or operand instead
    andOperands.length > 1 ? remove(operandIndex) : removeOrOperand();
  }

  function appendAndOperand() {
    append(NewAstNode());
  }

  return (
    <>
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
              {renderAstNode({ name: `${name}.${operandIndex}` })}
            </div>
            <LogicalOperator operator={operandIndex === 0 ? 'if' : 'and'} />
          </div>
        );
      })}

      <AddLogicalOperator
        className="text-grey-25 h-fit w-fit text-xs"
        variant="secondary"
        onClick={appendAndOperand}
        operator="and"
      />
    </>
  );
}
