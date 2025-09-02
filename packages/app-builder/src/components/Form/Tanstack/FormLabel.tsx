import { Label } from 'radix-ui';
import * as React from 'react';
import { cn } from 'ui-design-system';

interface FormLabelProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Label.Root>, 'htmlFor'> {
  name: string;
  valid?: boolean;
}

export const FormLabel = React.forwardRef<React.ElementRef<typeof Label.Root>, FormLabelProps>(
  function FormLabel({ className, valid, name, ...props }, ref) {
    return (
      <Label.Root
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
