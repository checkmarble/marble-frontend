import * as React from 'react';
import { Input, type InputProps } from 'ui-design-system';

interface FormInputProps extends Omit<InputProps, 'borderColor' | 'type'> {
  enablePasswordManagers?: boolean;
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

export const FormInput = React.forwardRef<React.ElementRef<typeof Input>, FormInputProps>(function FormInput(
  { valid, enablePasswordManagers, ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      id={props.name}
      borderColor={valid ? 'greyfigma-90' : 'redfigma-47'}
      {...(!enablePasswordManagers && {
        'data-1p-ignore': 'true', // 1password
        'data-lpignore': 'true', // lastpass
        'data-bwignore': 'true', // bitwarden
        'data-form-type': 'other', // used by dashlane, tells it to ignore this field for password saving
      })}
      {...props}
    />
  );
});
