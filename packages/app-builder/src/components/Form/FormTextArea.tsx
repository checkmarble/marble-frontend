import { getTextareaProps, useField } from '@conform-to/react';
import * as React from 'react';
import { TextArea, type TextAreaProps } from 'ui-design-system';

import { useFieldName } from './FormField';

interface FormTextAreaProps extends Omit<TextAreaProps, 'borderColor'> {}

export const FormTextArea = React.forwardRef<
  React.ElementRef<typeof TextArea>,
  FormTextAreaProps
>(function FormTextArea(props, ref) {
  const name = useFieldName();
  const [meta] = useField<string>(name);
  return (
    <TextArea
      ref={ref}
      borderColor={meta.valid ? 'grey-10' : 'red-100'}
      {...props}
      {...getTextareaProps(meta)}
      key={meta.key}
    />
  );
});
