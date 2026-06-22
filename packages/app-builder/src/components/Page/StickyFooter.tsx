import { forwardRef } from 'react';
import { cn } from 'ui-design-system';
import { pageLayoutGutter } from './page-layout';

type PageStickyFooterProps = React.ComponentProps<'div'> & {
  surface?: 'page' | 'card';
};

export const PageStickyFooter = forwardRef<HTMLDivElement, PageStickyFooterProps>(function PageStickyFooter(
  { className, surface = 'page', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'sticky bottom-0 flex items-center justify-between border-t border-transparent',
        surface === 'page' ? 'bg-surface-page' : 'bg-surface-card',
        pageLayoutGutter.bleedX,
        pageLayoutGutter.bleedBottom,
        pageLayoutGutter.paddingX,
        pageLayoutGutter.footerPaddingY,
        className,
      )}
      {...props}
    />
  );
});
PageStickyFooter.displayName = 'PageStickyFooter';
