import clsx from 'clsx';
import * as React from 'react';

import { useFieldConfig } from './FormField';

export const FormError = React.forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, 'id'>
>(function FormError({ className, children, ...props }, ref) {
  const { error, errorId } = useFieldConfig();

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
        className
      )}
      {...props}
    >
      {body}
    </p>
  );
});
