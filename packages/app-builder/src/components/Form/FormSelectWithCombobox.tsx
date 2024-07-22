import { createSimpleContext } from '@app-builder/utils/create-context';
import { adaptToStringArray } from '@app-builder/utils/form';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import { unstable_useControl, useField } from '@conform-to/react';
import * as React from 'react';
import {
  type Select,
  SelectWithCombobox,
  type SelectWithComboboxProviderProps,
} from 'ui-design-system';

import { useFieldName } from './FormField';

interface FormSelectWithComboboxContext {
  selectRef: React.RefObject<HTMLButtonElement>;
  valid: boolean;
}
const FormSelectWithComboboxContext =
  createSimpleContext<FormSelectWithComboboxContext>('FormSelectWithCombobox');
const useFormSelectWithComboboxContext = FormSelectWithComboboxContext.useValue;

interface FormSelectWithComboboxRootProps
  extends Omit<SelectWithComboboxProviderProps<string[]>, 'selectedValues'> {
  onOpenChange?: (open: boolean) => void;
  options: string[];
}

function FormSelectWithComboboxRoot({
  children,
  onSelectedValueChange: onSelectedValuesChange,
  onOpenChange,
  options,
  ...rest
}: FormSelectWithComboboxRootProps) {
  const selectRef = React.useRef<HTMLButtonElement>(null);
  const name = useFieldName();
  const [meta] = useField<string[]>(name);

  const control = unstable_useControl(meta);

  const initialValue = React.useMemo(
    () => adaptToStringArray(meta.initialValue),
    [meta.initialValue],
  );

  const selectedValue = React.useMemo(
    () => adaptToStringArray(control.value),
    [control.value],
  );

  const contextValue = React.useMemo(
    () => ({
      selectRef,
      valid: meta.valid,
    }),
    [selectRef, meta.valid],
  );
  return (
    <FormSelectWithComboboxContext.Provider value={contextValue}>
      <select
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        ref={control.register}
        multiple
        name={meta.name}
        defaultValue={initialValue.filter((val) => val !== undefined)}
        onFocus={() => {
          selectRef.current?.focus();
        }}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </select>

      <SelectWithCombobox.Root
        {...rest}
        selectedValue={selectedValue}
        onSelectedValueChange={(value) => {
          control.change(value);
          onSelectedValuesChange?.(value);
        }}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
          onOpenChange?.(open);
        }}
      >
        {children}
      </SelectWithCombobox.Root>
    </FormSelectWithComboboxContext.Provider>
  );
}

const FormSelectWithComboboxSelect = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Select.Trigger>, 'borderColor'>
>(function FormSelectTrigger(props, ref) {
  const { valid, selectRef } = useFormSelectWithComboboxContext();
  const composedRef = useComposedRefs(ref, selectRef);

  return (
    <SelectWithCombobox.Select
      ref={composedRef}
      borderColor={valid ? 'grey-10' : 'red-100'}
      {...props}
    />
  );
});

const FormSelectWithComboboxPopover = React.forwardRef<
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
