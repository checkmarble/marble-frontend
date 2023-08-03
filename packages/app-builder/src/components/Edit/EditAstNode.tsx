import {
  adaptAstNodeToViewModelFromIdentifier,
  type AstNode,
} from '@app-builder/models';
import {
  useEditorIdentifiers,
  useEditorOperators,
  useGetIdentifierOptions,
  useGetOperatorName,
  useIsEditedOnce,
} from '@app-builder/services/editor';
import { Combobox, Select } from '@ui-design-system';
import { forwardRef, useState } from 'react';

import { FormControl, FormField, FormItem } from '../Form';

export function EditAstNode({ name }: { name: string }) {
  const isFirstChildEditedOnce = useIsEditedOnce(`${name}.children.0`);
  const isNameEditedOnce = useIsEditedOnce(`${name}.name`);

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
          <FormItem className={isFirstChildEditedOnce ? '' : 'hidden'}>
            <FormControl>
              <EditOperator {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name={`${name}.children.1`}
        render={({ field }) => (
          <FormItem className={isNameEditedOnce ? '' : 'hidden'}>
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
    name: string;
    value: AstNode;
    onChange: (value: AstNode | null) => void;
    onBlur: () => void;
  }
>(({ onChange, onBlur, value }, ref) => {
  const editorIdentifier = useEditorIdentifiers();
  const getIdentifierOptions = useGetIdentifierOptions();
  const selectedItem = value
    ? adaptAstNodeToViewModelFromIdentifier(value, editorIdentifier)
    : null;

  const [inputValue, setInputValue] = useState(selectedItem?.label ?? '');

  const items = getIdentifierOptions(inputValue);

  const filteredItems = items.filter((item) => item.label.includes(inputValue));

  return (
    <Combobox.Root<(typeof items)[0]>
      value={selectedItem}
      onChange={(value) => {
        setInputValue(value?.label ?? '');
        onChange(value?.astNode ?? null);
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

const EditOperator = forwardRef<
  HTMLButtonElement,
  {
    name: string;
    value: string | null;
    onChange: (value: string | null) => void;
    onBlur: () => void;
  }
>(({ name, value, onChange, onBlur }, ref) => {
  const operators = useEditorOperators();
  const getOperatorName = useGetOperatorName();

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
          {operators.map((operator) => {
            return (
              <Select.Item
                className="min-w-[110px]"
                key={operator.name}
                value={operator.name}
              >
                <Select.ItemText>
                  <span className="text-s text-grey-100 font-semibold">
                    {getOperatorName(operator.name)}
                  </span>
                </Select.ItemText>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
});
EditOperator.displayName = 'EditOperator';
