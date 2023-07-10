import { useEditorIdentifiers } from '@marble-front/builder/services/editor/identifiers';
import { type AstNode, NewAstNode } from '@marble-front/models';
import { Combobox, Select } from '@marble-front/ui/design-system';
import { forwardRef, useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useGetOperatorLabel } from '../Scenario/Formula/Operators';
import { FormControl, FormField, FormItem } from './Form';

export function EditAstNode({ name }: { name: string }) {
  const { getFieldState, formState } = useFormContext();
  const firstChildState = getFieldState(`${name}.children.0`, formState);
  const nameState = getFieldState(`${name}.name`, formState);
  console.log(firstChildState, nameState);

  return (
    <div className="flex flex-row gap-1">
      <FormField
        name={`${name}.children.0`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <EditOperand {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name={`${name}.name`}
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem className={firstChildState.isDirty ? '' : 'hidden'}>
            <FormControl>
              <EditOperator {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name={`${name}.children.1`}
        render={({ field }) => (
          <FormItem className={nameState.isDirty ? '' : 'hidden'}>
            <FormControl>
              <EditOperand {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

const EditOperand = forwardRef<
  HTMLInputElement,
  {
    value: AstNode;
    onChange: (value: AstNode | null) => void;
  }
>(({ value, onChange, ...otherProps }, ref) => {
  const getIdentifierOptions = useGetIdentifierOptions();
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<
    ReturnType<typeof getIdentifierOptions>[number] | null
  >(null);
  const items = getIdentifierOptions(inputValue);

  const filteredItems = items.filter((item) => item.label.includes(inputValue));

  return (
    <Combobox.Root
      value={selectedItem}
      onChange={(value) => {
        setSelectedItem(value);
        onChange(value?.node ?? null);
      }}
      nullable
    >
      <div className="relative">
        <Combobox.Input
          ref={ref}
          displayValue={(item?: (typeof items)[number]) => item?.label ?? ''}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={() => {
            otherProps?.onBlur?.();
          }}
        />
        <Combobox.Options className="w-fit">
          {filteredItems.map((item) => (
            <Combobox.Option
              key={item.label}
              value={item}
              className="flex flex-col gap-1"
            >
              <span>{item.label}</span>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox.Root>
  );
});
EditOperand.displayName = 'EditOperand';

function coerceToConstant(search: string) {
  const parsedNumber = Number(search);
  const isNumber = !isNaN(parsedNumber);

  if (isNumber) {
    return {
      label: search,
      node: NewAstNode({
        name: 'CONSTANT_FLOAT',
        constant: parsedNumber,
      }),
    };
  }

  return {
    label: `"${search}"`,
    node: NewAstNode({
      name: 'CONSTANT_STRING',
      constant: search,
    }),
  };
}

function useGetIdentifierOptions() {
  const identifiers = useEditorIdentifiers();

  return useCallback(
    (search: string) => {
      if (!search) return identifiers;
      return [...identifiers, coerceToConstant(search)];
    },
    [identifiers]
  );
}

const EditOperator = forwardRef<
  HTMLButtonElement,
  {
    value: string | null;
    onChange: (value: string | null) => void;
  }
>(({ value, onChange, ...otherProps }, ref) => {
  const getOperatorLabel = useGetOperatorLabel();

  return (
    <Select.Root
      value={value ?? undefined}
      onValueChange={(selectedId) => {
        onChange(selectedId ?? null);
      }}
    >
      <Select.Trigger
        ref={ref}
        className="focus:border-purple-100"
        onBlur={otherProps?.onBlur}
      >
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {mockedOperators.map((operator) => {
            return (
              <Select.Item
                className="min-w-[110px]"
                key={operator}
                value={operator}
              >
                <p className="flex flex-col gap-1">
                  <Select.ItemText>
                    <span className="text-s text-grey-100 font-semibold">
                      {getOperatorLabel(operator)}
                    </span>
                  </Select.ItemText>
                  <span className="text-grey-50 text-xs">{operator}</span>
                </p>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
});
EditOperator.displayName = 'EditOperator';

const mockedOperators = [
  'EQUAL_BOOL',
  'EQUAL_FLOAT',
  'EQUAL_STRING',
  'AND',
  'PRODUCT_FLOAT',
  'OR',
  'SUM_FLOAT',
  'SUBTRACT_FLOAT',
  'DIVIDE_FLOAT',
  'GREATER_FLOAT',
  'GREATER_OR_EQUAL_FLOAT',
  'LESSER_FLOAT',
  'LESSER_OR_EQUAL_FLOAT',
  'STRING_IS_IN_LIST',
] as const;
