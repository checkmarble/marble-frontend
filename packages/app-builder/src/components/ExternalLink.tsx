import { cn } from 'ui-design-system';

export const linkClasses =
  'hover:text-purple-hover focus:text-purple-hover font-semibold lowercase text-purple-primary hover:underline focus:underline';

export const ExternalLink = function ExternalLink({
  ref,
  className,
  children,
  ...otherProps
}: React.ComponentPropsWithoutRef<'a'> & { ref?: React.Ref<HTMLAnchorElement> }) {
  return (
    <a ref={ref} className={cn(linkClasses, className)} target="_blank" rel="noopener noreferrer" {...otherProps}>
      {children}
    </a>
  );
};
