import { getInputProps, useField } from '@conform-to/react';
import * as React from 'react';
import { Input, type InputProps } from 'ui-design-system';

import { useFieldName } from './FormField';

interface FormInputProps extends Omit<InputProps, 'borderColor' | 'type'> {
  type:
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'month'
    | 'number'
    | 'password'
    | 'range'
    | 'search'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
}

export const FormInput = React.forwardRef<React.ElementRef<typeof Input>, FormInputProps>(
  function FormInput({ type, ...inputProps }, ref) {
    const { name, description } = useFieldName();
    const [meta] = useField<string>(name);

    return (
      <Input
        ref={ref}
        borderColor={meta.valid ? 'greyfigma-90' : 'redfigma-47'}
        {...inputProps}
        {...getInputProps(meta, {
          type,
          ariaDescribedBy: description ? meta.descriptionId : undefined,
        })}
        key={meta.key}
      />
    );
  },
);
