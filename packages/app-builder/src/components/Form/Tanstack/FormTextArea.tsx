import * as React from 'react';
import { TextArea, type TextAreaProps } from 'ui-design-system';

interface FormTextAreaProps extends Omit<TextAreaProps, 'borderColor'> {
  valid?: boolean;
}

export const FormTextArea = React.forwardRef<React.ElementRef<typeof TextArea>, FormTextAreaProps>(
  function FormTextArea(props, ref) {
    return (
      <TextArea
        ref={ref}
        id={props.name}
        borderColor={props.valid ? 'greyfigma-90' : 'redfigma-47'}
        {...props}
      />
    );
  },
);
