import * as React from 'react';
import { TextArea, type TextAreaProps } from 'ui-design-system';

interface FormTextAreaProps extends Omit<TextAreaProps, 'borderColor'> {
  valid?: boolean;
}

export const FormTextArea = function FormTextArea({
  ref,
  ...props
}: FormTextAreaProps & { ref?: React.Ref<React.ElementRef<typeof TextArea>> }) {
  return <TextArea ref={ref} id={props.name} borderColor={props.valid ? 'greyfigma-90' : 'redfigma-47'} {...props} />;
};
