import { createSimpleContext } from '@app-builder/utils/create-context';
import { adaptToStringArray } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import { unstable_useControl, useField } from '@conform-to/react';
import * as React from 'react';
import {
  type Select,
  SelectWithCombobox,
  type SelectWithComboboxProviderProps,
} from 'ui-design-system';

import { useFieldName } from './FormField';

interface FormSelectWithComboboxContextValue {
  selectRef: React.RefObject<HTMLButtonElement>;
  control: {
    change: (value: string[]) => void;
    blur: () => void;
  };
}
const FormSelectWithComboboxContext =
  createSimpleContext<FormSelectWithComboboxContextValue>(
    'FormSelectWithComboboxContext',
  );
export const useFormSelectWithComboboxContext =
  FormSelectWithComboboxContext.useValue;

interface FormSelectWithComboboxControlProps {
  options: readonly string[];
  render: (props: { selectedValues: string[] }) => React.ReactNode;
}

function FormSelectWithComboboxControl({
  options,
  render,
}: FormSelectWithComboboxControlProps) {
  const selectRef = React.useRef<HTMLButtonElement>(null);
  const name = useFieldName();
  const [meta] = useField<string[]>(name);

  const control = unstable_useControl(meta);

  const initialValue = React.useMemo(
    () => adaptToStringArray(meta.initialValue),
    [meta.initialValue],
  );

  const selectedValues = React.useMemo(
    () => adaptToStringArray(control.value),
    [control.value],
  );

  const { change, blur } = control;

  const contextValue = React.useMemo(
    () => ({
      selectRef,
      control: {
        change,
        blur,
      },
    }),
    [blur, change],
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
        defaultValue={initialValue}
        onFocus={() => {
          selectRef.current?.focus();
        }}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </select>
      {render({ selectedValues })}
    </FormSelectWithComboboxContext.Provider>
  );
}

interface FormSelectWithComboboxRootProps
  extends Omit<
    SelectWithComboboxProviderProps<string[]>,
    'onSelectedValuesChange' | 'selectedValues'
  > {
  selectedValues: string[];
  onSelectedValuesChange?: (values: string[]) => void;
}

function FormSelectWithComboboxRoot({
  children,
  onSelectedValuesChange,
  onOpenChange,
  selectedValues,
  ...rest
}: FormSelectWithComboboxRootProps) {
  const { control } = useFormSelectWithComboboxContext();

  const { change, blur } = control;

  const _onSelectedValueChange = React.useCallback(
    (value: string[]) => {
      change(value);
      onSelectedValuesChange?.(value);
    },
    [change, onSelectedValuesChange],
  );

  const _onOpenChange = useCallbackRef((open: boolean) => {
    if (!open) {
      blur();
    }
    onOpenChange?.(open);
  });

  return (
    <SelectWithCombobox.Root
      {...rest}
      selectedValue={selectedValues}
      onSelectedValueChange={_onSelectedValueChange}
      onOpenChange={_onOpenChange}
    >
      {children}
    </SelectWithCombobox.Root>
  );
}

const FormSelectWithComboboxSelect = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Select.Trigger>, 'borderColor'>
>(function FormSelectTrigger(props, ref) {
  const { selectRef } = useFormSelectWithComboboxContext();
  const name = useFieldName();
  const [meta] = useField<string[]>(name);
  const composedRef = useComposedRefs(ref, selectRef);

  return (
    <SelectWithCombobox.Select
      ref={composedRef}
      borderColor={meta.valid ? 'grey-10' : 'red-100'}
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
  Control: FormSelectWithComboboxControl,
  Root: FormSelectWithComboboxRoot,
  Select: FormSelectWithComboboxSelect,
  Arrow: SelectWithCombobox.Arrow,
  Popover: FormSelectWithComboboxPopover,
  Combobox: SelectWithCombobox.Combobox,
  ComboboxList: SelectWithCombobox.ComboboxList,
  ComboboxItem: SelectWithCombobox.ComboboxItem,
};
