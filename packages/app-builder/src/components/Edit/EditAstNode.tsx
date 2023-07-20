import { type AstNode, NewAstNode } from '@app-builder/models';
import { useEditorIdentifiers } from '@app-builder/services/editor';
import { Combobox, Select } from '@ui-design-system';
import { forwardRef, useCallback, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '../Form';
//import { useGetOperatorLabel } from '../Scenario/Formula/Operators';

function isAstNodeEmpty(node: AstNode): boolean {
  return !node.name && !node.constant && node.children?.length === 0 && Object.keys(node.namedChildren).length ===0;
}

export function EditAstNode({ name }: { name: string }) {
  const firstChildNode = useWatch(`${name}.children.0`);
  const nameNode = useWatch(`${name}.name`);

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
          <FormItem className={firstChildNode && !isAstNodeEmpty(firstChildNode) ? '' : 'hidden'}>
            <FormControl>
              <EditOperator {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name={`${name}.children.1`}
        render={({ field }) => (
          <FormItem className={nameNode && !isAstNodeEmpty(nameNode) ? '' : 'hidden'}>
            <FormControl>
              <EditOperand {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
function getSelectedItem({value}: {value: AstNode | null }){
  if(!value) return null

  if (!value.name && value.constant) {
    return {label: value.constant.toString(), node: value}
  }
  return null
}

//TODO: connect value to Combobox (we may need to save {label:string; node: AstNode} in the form to ease the process)
const EditOperand = forwardRef<
  HTMLInputElement,
  {
    name: string;
    value: AstNode | null;
    onChange: (value: AstNode | null) => void;
    onBlur: () => void;
  }
>(({ onChange, onBlur, value }, ref) => {
  const getIdentifierOptions = useGetIdentifierOptions();

  const selectedItem = getSelectedItem({value})
  
  const [inputValue, setInputValue] = useState(selectedItem?.label ?? "");
  
  const items = getIdentifierOptions(inputValue);

  const filteredItems = items.filter((item) => item.label.includes(inputValue));
  
  items.find((item) => item.node === value)

  return (
    <Combobox.Root
      value={selectedItem}
      onChange={(value) => {
        onChange(value?.node ?? null);
      }}
      nullable
    >
      <div className="relative">
        <Combobox.Input
          ref={ref}
          displayValue={(item?: (typeof items)[number]) => item?.label ?? ''}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={onBlur}
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
        constant: parsedNumber,
      }),
    };
  }

  return {
    label: `"${search}"`,
    node: NewAstNode({
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
    name: string;
    value: string | null;
    onChange: (value: string | null) => void;
    onBlur: () => void;
  }
>(({ name, value, onChange, onBlur }, ref) => {
  // const getOperatorLabel = useGetOperatorLabel();

  return (
    <Select.Root
      name={name}
      value={value ?? undefined}
      onValueChange={(selectedId) => {
        onChange(selectedId ?? null);
      }}
    >
      <Select.Trigger
        ref={ref}
        className="focus:border-purple-100"
        onBlur={onBlur}
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
                      {/* {getOperatorLabel(operator)} */}
                      {operator}
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
  '=',
] as const;
