import clsx from 'clsx';
import { forwardRef } from 'react';

export const linkClasses =
  'hover:text-purple-60 focus:text-purple-60 font-semibold lowercase text-purple-65 hover:underline focus:underline';

export const ExternalLink = forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>(
  function ExternalLink({ className, children, ...otherProps }, ref) {
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
  },
);
