import { useField } from '@conform-to/react';
import clsx from 'clsx';
import * as React from 'react';

import { useFieldName } from './FormField';

interface FormErrorProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'id'> {}

export const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  function FormError({ className, children, ...props }, ref) {
    const name = useFieldName();
    const [meta] = useField(name);

    const { errors, errorId } = meta;

    const error = errors?.at(0);

    if (!error) {
      return null;
    }

    const body = children ?? error;

    return (
      <p
        ref={ref}
        id={errorId}
        className={clsx(
          'text-s font-medium text-red-100 transition-opacity duration-200 ease-in-out',
          className,
        )}
        {...props}
      >
        {body}
      </p>
    );
  },
);
