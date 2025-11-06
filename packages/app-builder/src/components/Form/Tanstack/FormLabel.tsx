import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';
import { cn } from 'ui-design-system';

interface FormLabelProps extends Omit<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>, 'htmlFor'> {
  name: string;
  valid?: boolean;
}

export const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, FormLabelProps>(
  function FormLabel({ className, valid, name, ...props }, ref) {
    return (
      <LabelPrimitive.Root
        ref={ref}
        htmlFor={name}
        className={cn(className, {
          'text-red-47': valid !== undefined && !valid,
        })}
        {...props}
      />
    );
  },
);
