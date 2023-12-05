import * as LabelPrimitive from '@radix-ui/react-label';
import clsx from 'clsx';
import * as React from 'react';

import { useFieldConfig } from './FormField';

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>, 'htmlFor'>
>(function FormLabel({ className, ...props }, ref) {
  const { id, error } = useFieldConfig();

  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={id}
      className={clsx(!!error && 'text-red-100', className)}
      {...props}
    />
  );
});
