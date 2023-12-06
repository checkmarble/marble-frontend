import { conform } from '@conform-to/react';
import * as React from 'react';
import { TextArea, type TextAreaProps } from 'ui-design-system';

import { useFieldConfig } from './FormField';
import { type ControlOptions, extractControlOptions } from './helpers';

export const FormTextArea = React.forwardRef<
  React.ElementRef<typeof TextArea>,
  ControlOptions & Omit<TextAreaProps, 'borderColor'>
>(function FormTextArea(props, ref) {
  const config = useFieldConfig();
  const { options, ...rest } = extractControlOptions(props);

  return (
    <TextArea
      ref={ref}
      borderColor={config.error ? 'red-100' : 'grey-10'}
      {...conform.textarea(config, options)}
      {...rest}
    />
  );
});
