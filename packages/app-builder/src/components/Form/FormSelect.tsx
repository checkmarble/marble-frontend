import { createSimpleContext } from '@app-builder/utils/create-context';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import {
  getSelectProps,
  unstable_useControl,
  useField,
} from '@conform-to/react';
import { type SelectValueProps } from '@radix-ui/react-select';
import * as React from 'react';
import { Select } from 'ui-design-system';

import { useFieldName } from './FormField';

interface FormSelectContext {
  selectRef: React.RefObject<HTMLButtonElement>;
  valid: boolean;
}
const FormSelectContext = createSimpleContext<FormSelectContext>('FormSelect');
const useFormSelectContext = FormSelectContext.useValue;

interface FormSelectRootProps
  extends Omit<React.ComponentProps<typeof Select.Root>, 'value'> {
  options: readonly { value: string }[] | readonly string[];
}

function FormSelectRoot({
  children,
  onValueChange,
  options,
  ...rest
}: FormSelectRootProps) {
  const selectRef = React.useRef<HTMLButtonElement>(null);
  const { name, description } = useFieldName();
  const [meta] = useField<string>(name);

  const control = unstable_useControl(meta);

  const contextValue = React.useMemo(
    () => ({
      selectRef,
      valid: meta.valid,
    }),
    [selectRef, meta.valid],
  );
  return (
    <FormSelectContext.Provider value={contextValue}>
      <select
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        ref={control.register}
        {...getSelectProps(meta, {
          ariaDescribedBy: description ? meta.descriptionId : undefined,
        })}
      >
        <option value="" />
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          return <option key={value} value={value} />;
        })}
      </select>
      <Select.Root
        {...rest}
        defaultValue={meta.initialValue}
        value={control.value}
        onValueChange={(value) => {
          control.change(value);
          onValueChange?.(value);
        }}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        {children}
      </Select.Root>
    </FormSelectContext.Provider>
  );
}

const FormSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Select.Trigger>, 'borderColor'>
>(function FormSelectTrigger(props, ref) {
  const { valid, selectRef } = useFormSelectContext();
  const composedRef = useComposedRefs(ref, selectRef);

  return (
    <Select.Trigger
      ref={composedRef}
      borderColor={valid ? 'grey-10' : 'red-100'}
      {...props}
    />
  );
});

export type SelectProps = React.ComponentProps<typeof FormSelectRoot> &
  Pick<SelectValueProps, 'placeholder'> &
  Pick<React.ComponentProps<typeof FormSelectTrigger>, 'border' | 'className'>;

const FormSelectDefault = React.forwardRef<HTMLButtonElement, SelectProps>(
  function SelectDefault(
    { children, placeholder, border, className, ...props },
    triggerRef,
  ) {
    return (
      <FormSelectRoot {...props}>
        <FormSelectTrigger
          ref={triggerRef}
          border={border}
          className={className}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Arrow />
        </FormSelectTrigger>
        <Select.Content
          className="max-h-60 min-w-[var(--radix-select-trigger-width)]"
          align={border === 'rounded' ? 'center' : 'start'}
        >
          <Select.Viewport>{children}</Select.Viewport>
        </Select.Content>
      </FormSelectRoot>
    );
  },
);

export const FormSelect = {
  Default: FormSelectDefault,
  DefaultItem: Select.DefaultItem,
  Root: FormSelectRoot,
  Trigger: FormSelectTrigger,
  Value: Select.Value,
  Arrow: Select.Arrow,
  Content: Select.Content,
  Viewport: Select.Viewport,
  Item: Select.Item,
  ItemText: Select.ItemText,
};
