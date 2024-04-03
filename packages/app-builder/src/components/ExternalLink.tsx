import clsx from 'clsx';
import { forwardRef } from 'react';

export const ExternalLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'>
>(function ExternalLink({ className, children, ...otherProps }, ref) {
  return (
    <a
      ref={ref}
      className={clsx(
        'hover:text-purple-120 focus:text-purple-120 font-semibold lowercase text-purple-100 hover:underline focus:underline',
        className,
      )}
      target="_blank"
      rel="noreferrer"
      {...otherProps}
    >
      {children}
    </a>
  );
});
