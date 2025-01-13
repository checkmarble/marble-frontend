import { createSimpleContext } from '@app-builder/utils/create-context';
import { adaptToStringArray } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import {
  getSelectProps,
  unstable_useControl,
  useField,
} from '@conform-to/react';
import * as React from 'react';
import {
  type Select,
  SelectWithCombobox,
  type SelectWithComboboxProviderProps,
} from 'ui-design-system';

import { useFieldName } from './FormField';

type Value = string | string[];
interface FormSelectWithComboboxContextValue<T extends Value = Value> {
  selectRef: React.RefObject<HTMLButtonElement>;
  control: {
    change: (value: T) => void;
    blur: () => void;
  };
}
const FormSelectWithComboboxContext =
  createSimpleContext<FormSelectWithComboboxContextValue>(
    'FormSelectWithComboboxContext',
  );
export const useFormSelectWithComboboxContext =
  FormSelectWithComboboxContext.useValue;

interface FormSelectWithComboboxControlProps<Multiple extends boolean> {
  /**
   * Whether the select allows multiple values. This is redundant with the field schema, but to ensure static typing, it is required to specify it here.
   */
  multiple: Multiple;
  options: readonly string[];
  render: (props: {
    selectedValue: Multiple extends true ? string[] : string | undefined;
  }) => React.ReactNode;
}

function FormSelectWithComboboxControl<Multiple extends boolean>({
  multiple,
  options,
  render,
}: FormSelectWithComboboxControlProps<Multiple>) {
  const selectRef = React.useRef<HTMLButtonElement>(null);
  const { name, description } = useFieldName();
  const [meta] = useField<string[]>(name);

  if (import.meta.env.DEV) {
    // Ensure the field schema and the component configuration are compatible. This is a runtime check, only included in development.
    // Caveat: This check assumes the `constraint: getZodConstraint(schema)` is used in the `useForm` call.
    if (multiple !== Boolean(meta.multiple)) {
      throw new Error(
        meta.multiple
          ? 'The field schema seems to allow multiple values, but the `FormSelectWithComboboxControl` component is not configured to handle multiple values.'
          : 'The field schema does not allow multiple values, but the `FormSelectWithComboboxControl` component is configured to handle multiple values.',
      );
    }
  }

  const control = unstable_useControl(meta);

  const selectedValue = React.useMemo(
    (): Multiple extends true ? string[] : string | undefined =>
      // @ts-expect-error should be resolved in 5.8 https://github.com/microsoft/TypeScript/pull/56941
      multiple ? adaptToStringArray(control.value) : control.value,
    [control.value, multiple],
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
        onFocus={() => {
          selectRef.current?.focus();
        }}
        {...getSelectProps(meta, {
          ariaDescribedBy: description ? meta.descriptionId : undefined,
        })}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </select>
      {render({ selectedValue })}
    </FormSelectWithComboboxContext.Provider>
  );
}

interface FormSelectWithComboboxRootProps<T extends Value = Value>
  extends SelectWithComboboxProviderProps<T> {}

function FormSelectWithComboboxRoot<T extends Value = Value>({
  children,
  onSelectedValueChange,
  onOpenChange,
  selectedValue,
  ...rest
}: FormSelectWithComboboxRootProps<T>) {
  const { control } = useFormSelectWithComboboxContext();

  const { change, blur } = control;

  const _onSelectedValueChange = React.useCallback(
    (value: T) => {
      change(value);
      onSelectedValueChange?.(value);
    },
    [change, onSelectedValueChange],
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
      selectedValue={selectedValue}
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
  const { name } = useFieldName();
  const [meta] = useField<string[]>(name);
  const composedRef = useComposedRefs(ref, selectRef);

  return (
    <SelectWithCombobox.Select
      ref={composedRef}
      borderColor={meta.valid ? 'greyfigma-90' : 'redfigma-47'}
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
