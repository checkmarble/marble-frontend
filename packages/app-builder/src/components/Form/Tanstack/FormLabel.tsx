import * as LabelPrimitive from '@radix-ui/react-label';
import clsx from 'clsx';
import * as React from 'react';

interface FormLabelProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    'htmlFor'
  > {
  name: string;
  valid?: boolean;
}

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(function FormLabel({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={props.name}
      className={clsx(className, {
        'text-red-47': props.valid !== undefined && !props.valid,
      })}
      {...props}
    />
  );
});
