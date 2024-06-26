import clsx from 'clsx';
import { forwardRef } from 'react';

export const linkClasses =
  'hover:text-purple-120 focus:text-purple-120 font-semibold lowercase text-purple-100 hover:underline focus:underline';

export const ExternalLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'>
>(function ExternalLink({ className, children, ...otherProps }, ref) {
  return (
    <a
      ref={ref}
      className={clsx(linkClasses, className)}
      target="_blank"
      rel="noopener noreferrer"
      {...otherProps}
    >
      {children}
    </a>
  );
});
