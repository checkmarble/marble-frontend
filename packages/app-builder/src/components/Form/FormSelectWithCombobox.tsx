import { createSimpleContext } from '@app-builder/utils/create-context';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import { stringToStringArray } from '@app-builder/utils/schema/stringToJSONSchema';
import { conform, type FieldConfig, useInputEvent } from '@conform-to/react';
import { forwardRef, type RefObject, useRef, useState } from 'react';
import { type Select, SelectWithCombobox } from 'ui-design-system';

interface FormSelectWithComboboxContext<Schema extends string[]> {
  buttonRef: RefObject<HTMLButtonElement>;
  config: FieldConfig<Schema>;
}
const FormSelectWithComboboxContext = createSimpleContext<
  FormSelectWithComboboxContext<string[]>
>('FormSelectWithCombobox');
const useFormSelectWithComboboxContext = FormSelectWithComboboxContext.useValue;

function FormSelectWithComboboxRoot<Schema extends string[]>({
  config,
  children,
  onSelectedValuesChange,
  ...rest
}: Omit<
  React.ComponentProps<typeof SelectWithCombobox.Provider>,
  'selectedValues'
> & {
  config: FieldConfig<Schema>;
}) {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    config.defaultValue ?? [],
  );

  const shadowInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const control = useInputEvent({
    ref: shadowInputRef,
    onReset: () => setSelectedValues(config.defaultValue ?? []),
  });

  const contextValue = {
    buttonRef,
    config,
  };
  return (
    <SelectWithCombobox.Popover.Root>
      <FormSelectWithComboboxContext.Provider value={contextValue}>
        <input
          ref={shadowInputRef}
          {...conform.input(config, { hidden: true })}
          onFocus={() => buttonRef.current?.focus()}
          onChange={(e) => {
            const parsedValue = stringToStringArray.safeParse(e.target.value);
            setSelectedValues(parsedValue.success ? parsedValue.data : []);
          }}
        />
        <SelectWithCombobox.Provider
          {...rest}
          selectedValues={selectedValues}
          onSelectedValuesChange={(value) => {
            control.change(JSON.stringify(value));
            onSelectedValuesChange?.(value);
          }}
        >
          {children}
        </SelectWithCombobox.Provider>
      </FormSelectWithComboboxContext.Provider>
    </SelectWithCombobox.Popover.Root>
  );
}

const FormSelectWithComboboxTrigger = forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Select.Trigger>, 'borderColor'>
>(function FormSelectTrigger(props, ref) {
  const { buttonRef, config } = useFormSelectWithComboboxContext();
  const composedRef = useComposedRefs(ref, buttonRef);

  return (
    <SelectWithCombobox.Popover.Trigger
      ref={composedRef}
      borderColor={config.error ? 'red-100' : 'grey-10'}
      {...props}
    />
  );
});

export const FormSelectWithCombobox = {
  Root: FormSelectWithComboboxRoot,
  Trigger: FormSelectWithComboboxTrigger,
  Content: SelectWithCombobox.Popover.Content,
  Combobox: SelectWithCombobox.Combobox,
  ComboboxList: SelectWithCombobox.ComboboxList,
  ComboboxItem: SelectWithCombobox.ComboboxItem,
};
