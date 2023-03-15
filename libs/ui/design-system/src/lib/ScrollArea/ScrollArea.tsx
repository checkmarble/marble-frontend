import {
  Corner,
  Root,
  type ScrollAreaCornerProps,
  type ScrollAreaProps,
  type ScrollAreaScrollbarProps,
  type ScrollAreaThumbProps,
  type ScrollAreaViewportProps,
  Scrollbar,
  Thumb,
  Viewport,
} from '@radix-ui/react-scroll-area';
import clsx from 'clsx';
import { forwardRef, type RefAttributes } from 'react';

const ScrollAreaRoot = forwardRef<
  HTMLDivElement,
  ScrollAreaProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Root ref={ref} className={clsx('overflow-hidden', className)} {...props} />
));
ScrollAreaRoot.displayName = Root?.displayName;

const ScrollAreaScrollbar = forwardRef<
  HTMLDivElement,
  ScrollAreaScrollbarProps & RefAttributes<HTMLDivElement>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <Scrollbar
    ref={ref}
    className={clsx(
      'bg-grey-02 radix-orientation-horizontal:h-2 radix-orientation-vertical:w-2 hover:bg-grey-05 radix-orientation-horizontal:flex-col flex touch-none select-none p-0.5 transition',
      className
    )}
    orientation={orientation}
    {...props}
  />
));
ScrollAreaScrollbar.displayName = Scrollbar?.displayName;

const ScrollAreaThumb = forwardRef<
  HTMLDivElement,
  ScrollAreaThumbProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Thumb
    ref={ref}
    className={clsx('bg-grey-25 relative flex-1 rounded-lg', className)}
    {...props}
  />
));
ScrollAreaThumb.displayName = Thumb?.displayName;

const ScrollAreaCorner = forwardRef<
  HTMLDivElement,
  ScrollAreaCornerProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Corner ref={ref} className={clsx('bg-grey-05', className)} {...props} />
));
ScrollAreaCorner.displayName = Corner?.displayName;

/**
 * Override hardcoded style to bypass https://github.com/radix-ui/primitives/issues/926
 */
const ScrollAreaViewport = forwardRef<
  HTMLDivElement,
  ScrollAreaViewportProps & RefAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Viewport
    ref={ref}
    className={clsx('[&>:first-of-type]:!block', className)}
    {...props}
  />
));
ScrollAreaViewport.displayName = Viewport?.displayName;

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
};
