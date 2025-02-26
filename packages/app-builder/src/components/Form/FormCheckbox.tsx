import { getInputProps, unstable_useControl, useField } from '@conform-to/react';
import { Checkbox } from 'ui-design-system';

import { useFieldName } from './FormField';

interface FormCheckboxProps extends Omit<React.ComponentProps<typeof Checkbox>, 'checked'> {}

export function FormCheckbox({ children, onCheckedChange, ...rest }: FormCheckboxProps) {
  const { name, description } = useFieldName();
  const [meta] = useField<boolean>(name);

  const control = unstable_useControl(meta);

  const { type, ...otherProps } = getInputProps(meta, {
    type: 'checkbox',
    ariaDescribedBy: description ? meta.descriptionId : undefined,
  });

  return (
    // Radix UI don't expose the input element directly, so we need to query it
    <div ref={(element) => control.register(element?.querySelector('input'))}>
      <Checkbox
        {...otherProps}
        checked={control.value === 'on'}
        onCheckedChange={(state) => control.change(state.valueOf() ? 'on' : '')}
        onBlur={control.blur}
        {...rest}
      />
    </div>
  );
}
