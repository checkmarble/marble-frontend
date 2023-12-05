import { conform } from '@conform-to/react';
import * as React from 'react';
import { Input } from 'ui-design-system';

import { useFieldConfig } from './FormField';

type BaseOptions =
  | {
      ariaAttributes?: true;
      description?: boolean;
    }
  | {
      ariaAttributes: false;
    };
type ControlOptions = BaseOptions & {
  hidden?: boolean;
};
type InputOptions = ControlOptions &
  (
    | {
        type: 'checkbox' | 'radio';
        value?: string;
      }
    | {
        type?: Exclude<
          React.HTMLInputTypeAttribute,
          'button' | 'submit' | 'hidden'
        >;
        value?: never;
      }
  );

export const FormInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  InputOptions
>(function FormInput({ ...options }, ref) {
  const config = useFieldConfig();

  return (
    <Input
      ref={ref}
      borderColor={config.error ? 'red-100' : 'grey-10'}
      {...conform.input(config, options)}
    />
  );
});
