import { useField } from '@conform-to/react';
import * as React from 'react';

import { useFieldName } from './FormField';

interface FormErrorOrDescriptionProps
  extends Omit<
    React.HTMLAttributes<HTMLParagraphElement>,
    'id' | 'children' | 'className'
  > {
  errorClassName?: string;
  descriptionClassName?: string;
}

export const FormErrorOrDescription = React.forwardRef<
  HTMLParagraphElement,
  FormErrorOrDescriptionProps
>(function FormErrorOrDescription(
  { errorClassName, descriptionClassName, ...props },
  ref,
) {
  const { name, description } = useFieldName();
  const [meta] = useField(name);

  const { errors, errorId, descriptionId } = meta;

  const error = errors?.[0];

  if (error) {
    return (
      <p
        ref={ref}
        id={errorId}
        className={
          errorClassName ??
          'text-s text-red-47 font-medium transition-opacity duration-200 ease-in-out'
        }
        {...props}
      >
        {error}
      </p>
    );
  }

  if (description) {
    return (
      <p
        ref={ref}
        id={descriptionId}
        className={
          descriptionClassName ??
          'text-s text-grey-80 font-medium transition-opacity duration-200 ease-in-out'
        }
        {...props}
      >
        {description}
      </p>
    );
  }
  return null;
});
