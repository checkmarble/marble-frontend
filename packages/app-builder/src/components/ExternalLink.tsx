import { forwardRef } from 'react';
import { cn } from 'ui-design-system';

export const linkClasses =
  'hover:text-purple-hover focus:text-purple-hover font-semibold lowercase text-purple-primary hover:underline focus:underline';

export const ExternalLink = forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>(function ExternalLink(
  { className, children, ...otherProps },
  ref,
) {
  return (
    <a ref={ref} className={cn(linkClasses, className)} target="_blank" rel="noopener noreferrer" {...otherProps}>
      {children}
    </a>
  );
});
