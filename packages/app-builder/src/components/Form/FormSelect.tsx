import { createSimpleContext } from '@app-builder/utils/create-context';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import { conform, type FieldConfig, useInputEvent } from '@conform-to/react';
import { type SelectValueProps } from '@radix-ui/react-select';
import { forwardRef, type RefObject, useRef, useState } from 'react';
import { Select } from 'ui-design-system';

interface FormSelectContext<Schema extends string> {
  buttonRef: RefObject<HTMLButtonElement>;
  config: FieldConfig<Schema>;
}
const FormSelectContext =
  createSimpleContext<FormSelectContext<string>>('FormSelect');
const useFormSelectContext = FormSelectContext.useValue;

function FormSelectRoot<Schema extends string>({
  config,
  children,
  onValueChange,
  ...rest
}: Omit<React.ComponentProps<typeof Select.Root>, 'value'> & {
  config: FieldConfig<Schema>;
}) {
  const [value, setValue] = useState(config.defaultValue ?? '');
  const shadowInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const control = useInputEvent({
    ref: shadowInputRef,
    onReset: () => setValue(config.defaultValue ?? ''),
  });

  const contextValue = {
    buttonRef,
    config,
  };
  return (
    <FormSelectContext.Provider value={contextValue}>
      <input
        ref={shadowInputRef}
        {...conform.input(config, { hidden: true })}
        onFocus={() => buttonRef.current?.focus()}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <Select.Root
        {...rest}
        defaultValue={config.defaultValue}
        value={value}
        onValueChange={(value) => {
          control.change(value);
          onValueChange?.(value);
        }}
      >
        {children}
      </Select.Root>
    </FormSelectContext.Provider>
  );
}

const FormSelectTrigger = forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Select.Trigger>, 'borderColor'>
>(function FormSelectTrigger(props, ref) {
  const { buttonRef, config } = useFormSelectContext();
  const composedRef = useComposedRefs(ref, buttonRef);

  return (
    <Select.Trigger
      ref={composedRef}
      borderColor={config.error ? 'red-100' : 'grey-10'}
      {...props}
    />
  );
});

export type SelectProps = React.ComponentProps<typeof FormSelectRoot> &
  Pick<SelectValueProps, 'placeholder'> &
  Pick<React.ComponentProps<typeof FormSelectTrigger>, 'border' | 'className'>;

const FormSelectDefault = forwardRef<HTMLButtonElement, SelectProps>(
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
  Root: FormSelectRoot,
  Trigger: FormSelectTrigger,
  Value: Select.Value,
  Arrow: Select.Arrow,
  Content: Select.Content,
  Viewport: Select.Viewport,
  Item: Select.Item,
  ItemText: Select.ItemText,
};
