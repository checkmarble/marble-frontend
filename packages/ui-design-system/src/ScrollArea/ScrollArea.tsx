import clsx from 'clsx';
import { ScrollArea as RadixScrollArea } from 'radix-ui';
import { forwardRef, type RefAttributes } from 'react';

const ScrollAreaRoot = forwardRef<
  HTMLDivElement,
  RadixScrollArea.ScrollAreaProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <RadixScrollArea.Root ref={ref} className={clsx('overflow-hidden', className)} {...props} />
));
ScrollAreaRoot.displayName = RadixScrollArea.Root?.displayName;

const ScrollAreaScrollbar = forwardRef<
  HTMLDivElement,
  RadixScrollArea.ScrollAreaScrollbarProps & RefAttributes<HTMLDivElement>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <RadixScrollArea.Scrollbar
    ref={ref}
    className={clsx(
      'bg-grey-98 radix-orientation-horizontal:h-2 radix-orientation-vertical:w-2 hover:bg-grey-95 radix-orientation-horizontal:flex-col flex touch-none select-none p-0.5 transition',
      className,
    )}
    orientation={orientation}
    {...props}
  />
));
ScrollAreaScrollbar.displayName = RadixScrollArea.Scrollbar?.displayName;

const ScrollAreaThumb = forwardRef<
  HTMLDivElement,
  RadixScrollArea.ScrollAreaThumbProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <RadixScrollArea.Thumb
    ref={ref}
    className={clsx('bg-grey-80 relative flex-1 rounded-lg', className)}
    {...props}
  />
));
ScrollAreaThumb.displayName = RadixScrollArea.Thumb?.displayName;

const ScrollAreaCorner = forwardRef<
  HTMLDivElement,
  RadixScrollArea.ScrollAreaCornerProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <RadixScrollArea.Corner ref={ref} className={clsx('bg-grey-95', className)} {...props} />
));
ScrollAreaCorner.displayName = RadixScrollArea.Corner?.displayName;

/**
 * Override hardcoded style to bypass https://github.com/radix-ui/primitives/issues/926
 */
const ScrollAreaViewport = forwardRef<
  HTMLDivElement,
  RadixScrollArea.ScrollAreaViewportProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <RadixScrollArea.Viewport
    ref={ref}
    className={clsx('overscroll-x-contain [&>:first-of-type]:block!', className)}
    {...props}
  />
));
ScrollAreaViewport.displayName = RadixScrollArea.Viewport?.displayName;

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
};

/**
 * New ScrollArea with better DX
 */

type ScrollAreaElement = React.ElementRef<typeof RadixScrollArea.Viewport>;
interface ScrollAreaV2Props
  extends React.ComponentPropsWithRef<typeof RadixScrollArea.Root>,
    Omit<React.ComponentPropsWithRef<typeof RadixScrollArea.Viewport>, 'dir'> {
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollAreaV2 = forwardRef<ScrollAreaElement, ScrollAreaV2Props>(function ScrollAreaV2(
  { className, type, scrollHideDelay, dir, orientation = 'vertical', ...viewportProps },
  forwardedRef,
) {
  return (
    <RadixScrollArea.Root
      type={type}
      scrollHideDelay={scrollHideDelay}
      dir={dir}
      className={clsx('flex flex-col overflow-hidden', className)}
    >
      <RadixScrollArea.Viewport
        {...viewportProps}
        ref={forwardedRef}
        // Override hardcoded style to bypass https://github.com/radix-ui/primitives/issues/926
        className="size-full overscroll-x-contain [&>:first-of-type]:block!"
      />

      {orientation !== 'vertical' ? (
        <RadixScrollArea.Scrollbar
          orientation="horizontal"
          className="hover:bg-grey-90 m-px flex h-1 touch-none select-none flex-col rounded-full transition-colors"
        >
          <RadixScrollArea.Thumb className="bg-grey-80 hover:bg-grey-50 flex-1 rounded-full" />
        </RadixScrollArea.Scrollbar>
      ) : null}

      {orientation !== 'horizontal' ? (
        <RadixScrollArea.Scrollbar
          orientation="vertical"
          className="hover:bg-grey-90 m-px flex w-1 touch-none select-none flex-row rounded-full transition-colors"
        >
          <RadixScrollArea.Thumb className="bg-grey-80 hover:bg-grey-50 flex-1 rounded-full" />
        </RadixScrollArea.Scrollbar>
      ) : null}

      {orientation === 'both' ? <RadixScrollArea.Corner className="rounded-full" /> : null}
    </RadixScrollArea.Root>
  );
});
