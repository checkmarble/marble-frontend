import { useField } from '@conform-to/react';
import * as LabelPrimitive from '@radix-ui/react-label';
import clsx from 'clsx';
import * as React from 'react';

import { useFieldName } from './FormField';

interface FormLabelProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    'htmlFor'
  > {}

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(function FormLabel({ className, ...props }, ref) {
  const name = useFieldName();
  const [meta] = useField(name);
  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={meta.id}
      className={clsx(!meta.valid && 'text-red-100', className)}
      {...props}
    />
  );
});
