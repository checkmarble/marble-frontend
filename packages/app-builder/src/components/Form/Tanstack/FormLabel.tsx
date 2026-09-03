import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';
import { cn } from 'ui-design-system';

interface FormLabelProps extends Omit<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>, 'htmlFor'> {
  name: string;
  valid?: boolean;
}

export const FormLabel = function FormLabel({
  ref,
  className,
  valid,
  name,
  ...props
}: FormLabelProps & { ref?: React.Ref<React.ElementRef<typeof LabelPrimitive.Root>> }) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={name}
      className={cn(className, {
        'text-red-primary': valid !== undefined && !valid,
      })}
      {...props}
    />
  );
};
