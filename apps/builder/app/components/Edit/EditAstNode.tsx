import { type AstNode, NewAstNode } from '@marble-front/models';
import { ComboBox } from '@marble-front/ui/design-system';
import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel } from './Form';

export function EditAstNode({ name }: { name: string }) {
  const { getFieldState, formState } = useFormContext();
  const { isDirty } = getFieldState(`${name}.children.0`, formState);

  return (
    <div className="flex w-fit flex-row gap-1">
      <FormField
        name={`${name}.children.0`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="hidden">operand 0</FormLabel>
            <FormControl>
              <EditOperand {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name={`${name}.name`}
        render={({ field }) => (
          <FormItem className={isDirty ? '' : 'hidden'}>
            <FormLabel className="hidden">name</FormLabel>
            <FormControl>
              <EditOperand {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name={`${name}.children.1`}
        render={({ field }) => (
          <FormItem className={isDirty ? '' : 'hidden'}>
            <FormLabel className="hidden">operand 1</FormLabel>
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
>(({ value, onChange }, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<
    (typeof mockedIdentifiers)[number] | null
  >(null);
  const items = getIdentifierOptions(inputValue);

  return (
    <ComboBox
      items={items.filter((item) => item.label.includes(inputValue))}
      onInputValueChange={({ inputValue }) => setInputValue(inputValue ?? '')}
      itemToKey={(item) => item.label}
      itemToString={(item) => item?.label ?? ''}
      renderItemInList={({ item, isHighlighted, isSelected }) => (
        <div
          className={clsx(
            'bg-g flex flex-col px-3 py-2 shadow-sm',
            isHighlighted && 'bg-purple-05 text-purple-100',
            isSelected && 'text-purple-100'
          )}
        >
          <span>{item.label}</span>
          <span className="text-sm text-gray-700">{item.node.name}</span>
        </div>
      )}
      onSelectedItemChange={({ selectedItem }) => {
        setSelectedItem(selectedItem ?? null);
      }}
      selectedItem={selectedItem}
      inputValue={inputValue}
      onIsOpenChange={({ isOpen, selectedItem }) => {
        if (isOpen) return;
        setInputValue(selectedItem?.label ?? '');
        if (value !== selectedItem?.node) {
          onChange(selectedItem?.node ?? null);
        }
      }}
      inputRef={ref}
    />
  );
});
EditOperand.displayName = 'EditOperand';

const mockedIdentifiers: { label: string; node: AstNode }[] = [
  {
    label: 'account.is_frozen',
    node: NewAstNode({
      name: 'DB_FIELD_BOOL',
      namedChildren: {
        triggerTableName: {
          name: 'STRING_CONSTANT',
          constant: 'transaction',
          children: [],
          namedChildren: {},
        },
        path: {
          name: 'STRING_LIST_CONSTANT',
          constant: ['account'],
          children: [],
          namedChildren: {},
        },
        fieldName: {
          name: 'STRING_CONSTANT',
          constant: 'is_frozen',
          children: [],
          namedChildren: {},
        },
      },
    }),
  },
  {
    label: 'amount',
    node: NewAstNode({
      name: 'PAYLOAD_FIELD_FLOAT',
      namedChildren: {
        fieldName: {
          name: 'STRING_CONSTANT',
          constant: 'amount',
          children: [],
          namedChildren: {},
        },
      },
    }),
  },
];

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

function getIdentifierOptions(search: string) {
  if (!search) return mockedIdentifiers;
  return [...mockedIdentifiers, coerceToConstant(search)];
}
