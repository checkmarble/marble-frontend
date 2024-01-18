import { createSimpleContext } from '@app-builder/utils/create-context';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import { stringToStringArray } from '@app-builder/utils/schema/stringToJSONSchema';
import { conform, type FieldConfig, useInputEvent } from '@conform-to/react';
import { forwardRef, type RefObject, useMemo, useRef, useState } from 'react';
import {
  type Select,
  SelectWithCombobox,
  type SelectWithComboboxProviderProps,
} from 'ui-design-system';

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
  onSelectedValueChange: onSelectedValuesChange,
  onOpenChange,
  ...rest
}: Omit<SelectWithComboboxProviderProps<string[]>, 'selectedValues'> & {
  config: FieldConfig<Schema>;
  onOpenChange?: (open: boolean) => void;
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

  const contextValue = useMemo(
    () => ({
      buttonRef,
      config,
    }),
    [buttonRef, config],
  );
  return (
    <FormSelectWithComboboxContext.Provider value={contextValue}>
      <input
        ref={shadowInputRef}
        {...conform.input<string>(
          { ...config, defaultValue: JSON.stringify(config.defaultValue) },
          { hidden: true },
        )}
        onFocus={() => buttonRef.current?.focus()}
        onChange={(e) => {
          const parsedValue = stringToStringArray.safeParse(e.target.value);
          setSelectedValues(parsedValue.success ? parsedValue.data : []);
        }}
      />
      <SelectWithCombobox.Root
        {...rest}
        onOpenChange={onOpenChange}
        selectedValue={selectedValues}
        onSelectedValueChange={(value) => {
          control.change(JSON.stringify(value));
          return onSelectedValuesChange?.(value);
        }}
      >
        {children}
      </SelectWithCombobox.Root>
    </FormSelectWithComboboxContext.Provider>
  );
}

const FormSelectWithComboboxSelect = forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Select.Trigger>, 'borderColor'>
>(function FormSelectTrigger(props, ref) {
  const { buttonRef, config } = useFormSelectWithComboboxContext();
  const composedRef = useComposedRefs(ref, buttonRef);

  return (
    <SelectWithCombobox.Select
      ref={composedRef}
      borderColor={config.error ? 'red-100' : 'grey-10'}
      {...props}
    />
  );
});

const FormSelectWithComboboxPopover = forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof SelectWithCombobox.Popover>, 'portal'>
>(function FormSelectWithComboboxPopover(props, ref) {
  // Force portal=true to ensure the popover is rendered outside the form element
  // otherwise the combobox search input will be included in the form and interact with it
  return <SelectWithCombobox.Popover ref={ref} portal {...props} />;
});

export const FormSelectWithCombobox = {
  Root: FormSelectWithComboboxRoot,
  Select: FormSelectWithComboboxSelect,
  Arrow: SelectWithCombobox.Arrow,
  Popover: FormSelectWithComboboxPopover,
  Combobox: SelectWithCombobox.Combobox,
  ComboboxList: SelectWithCombobox.ComboboxList,
  ComboboxItem: SelectWithCombobox.ComboboxItem,
};
