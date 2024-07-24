import { useField } from '@conform-to/react';
import clsx from 'clsx';
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
>(function FormError({ errorClassName, descriptionClassName, ...props }, ref) {
  const { name, description } = useFieldName();
  const [meta] = useField(name);

  const { errors, errorId, descriptionId } = meta;

  const error = errors?.at(0);

  if (error) {
    return (
      <p
        ref={ref}
        id={errorId}
        className={clsx(
          'text-s font-medium text-red-100 transition-opacity duration-200 ease-in-out',
          errorClassName,
        )}
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
        className={clsx(
          'text-s text-grey-25 font-medium transition-opacity duration-200 ease-in-out',
          descriptionClassName,
        )}
        {...props}
      >
        {description}
      </p>
    );
  }
  return null;
});
