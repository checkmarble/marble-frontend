import clsx from 'clsx';
import * as React from 'react';
import { cn } from 'ui-design-system';

interface FormErrorOrDescriptionProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'id' | 'children' | 'className'> {
  errorClassName?: string;
  descriptionClassName?: string;
  errors?: string[];
  description?: string | React.ReactNode;
}

export const FormErrorOrDescription = React.forwardRef<HTMLParagraphElement, FormErrorOrDescriptionProps>(
  function FormErrorOrDescription({ errorClassName, descriptionClassName, ...props }, ref) {
    if (props.errors?.length) {
      return (
        <p
          ref={ref}
          className={cn(
            'bg-red-background text-s text-red-primary flex flex-col gap-1 rounded-sm border border-transparent px-2 py-1 font-medium transition-opacity duration-200 ease-in-out',
            'dark:bg-transparent dark:border-red-primary',
            errorClassName,
          )}
          {...props}
        >
          <span>{props.errors[0]}</span>
        </p>
      );
    }

    if (props.description) {
      return typeof props.description === 'string' ? (
        <p
          ref={ref}
          className={clsx(
            'text-s text-grey-secondary font-medium transition-opacity duration-200 ease-in-out',
            descriptionClassName,
          )}
          {...props}
        >
          {props.description}
        </p>
      ) : (
        props.description
      );
    }

    return null;
  },
);
