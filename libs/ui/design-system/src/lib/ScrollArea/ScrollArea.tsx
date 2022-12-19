import {
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
  type ScrollAreaProps,
  type ScrollAreaScrollbarProps,
  type ScrollAreaThumbProps,
  type ScrollAreaCornerProps,
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

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
};
