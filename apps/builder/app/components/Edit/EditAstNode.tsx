import { type AstNode, NewAstNode } from '@marble-front/models';
import { Combobox } from '@marble-front/ui/design-system';
import { forwardRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from './Form';

export function EditAstNode({ name }: { name: string }) {
  const { getFieldState, formState } = useFormContext();
  const { isDirty } = getFieldState(`${name}.children.0`, formState);

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
        render={({ field }) => (
          <FormItem className={isDirty ? '' : 'hidden'}>
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
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<
    (typeof mockedIdentifiers)[number] | null
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
      <div className="relative max-w-xs">
        <Combobox.Input
          ref={ref}
          displayValue={(item?: (typeof items)[number]) => item?.label ?? ''}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <Combobox.Options className="w-full">
          {filteredItems.map((item) => (
            <Combobox.Option
              key={item.label}
              value={item}
              className="flex flex-col gap-1"
            >
              <span>{item.label}</span>
              <span className="text-sm text-gray-700">{item.node.name}</span>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox.Root>
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
