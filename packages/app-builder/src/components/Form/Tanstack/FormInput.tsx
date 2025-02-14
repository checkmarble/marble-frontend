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

export const FormInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  FormInputProps
>(function FormInput({ type, valid, ...props }, ref) {
  return (
    <Input
      ref={ref}
      borderColor={valid ? 'greyfigma-90' : 'redfigma-47'}
      {...props}
    />
  );
});
