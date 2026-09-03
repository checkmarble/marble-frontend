import * as React from 'react';
import { Input, type InputProps } from 'ui-design-system';

interface FormInputProps extends Omit<InputProps, 'borderColor' | 'type'> {
  valid?: boolean;
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

/**
 * @deprecated use design system Inputs directly
 */
export const FormInput = function FormInput({
  ref,
  valid,
  ...props
}: FormInputProps & { ref?: React.Ref<React.ElementRef<typeof Input>> }) {
  return <Input ref={ref} id={props.name} borderColor={valid ? 'greyfigma-90' : 'redfigma-47'} {...props} />;
};
