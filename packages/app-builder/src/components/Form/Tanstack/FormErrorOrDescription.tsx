import { type ValidationError } from '@tanstack/react-form';
import clsx from 'clsx';
import * as React from 'react';

interface FormErrorOrDescriptionProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'id' | 'children' | 'className'> {
  errorClassName?: string;
  descriptionClassName?: string;
  errors?: ValidationError[];
  description?: string | React.ReactNode;
}

export const FormErrorOrDescription = React.forwardRef<
  HTMLParagraphElement,
  FormErrorOrDescriptionProps
>(function FormErrorOrDescription({ errorClassName, descriptionClassName, ...props }, ref) {
  if (props.errors?.length) {
    return (
      <p
        ref={ref}
        className={clsx(
          'text-s text-red-47 flex flex-col gap-1 font-medium transition-opacity duration-200 ease-in-out',
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
          'text-s text-grey-80 font-medium transition-opacity duration-200 ease-in-out',
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
});
