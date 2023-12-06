import { conform } from '@conform-to/react';
import * as React from 'react';
import { Input, type InputProps } from 'ui-design-system';

import { useFieldConfig } from './FormField';
import { extractInputOptions, type InputOptions } from './helpers';

export const FormInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  InputOptions & Omit<InputProps, 'borderColor'>
>(function FormInput(props, ref) {
  const config = useFieldConfig();

  const { options, ...rest } = extractInputOptions(props);

  return (
    <Input
      ref={ref}
      borderColor={config.error ? 'red-100' : 'grey-10'}
      {...rest}
      {...conform.input(config, options)}
    />
  );
});
