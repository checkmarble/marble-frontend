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
import { type RefAttributes } from 'react';

const ScrollAreaRoot = ({ ref, className, ...props }: ScrollAreaProps & RefAttributes<HTMLDivElement>) => (
  <Root ref={ref} className={clsx('overflow-hidden', className)} {...props} />
);

const ScrollAreaScrollbar = ({
  ref,
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaScrollbarProps & RefAttributes<HTMLDivElement>) => (
  <Scrollbar
    ref={ref}
    className={clsx(
      'bg-grey-background-light radix-orientation-horizontal:h-2 radix-orientation-vertical:w-2 hover:bg-grey-background radix-orientation-horizontal:flex-col flex touch-none select-none p-2xs transition',
      className,
    )}
    orientation={orientation}
    {...props}
  />
);

const ScrollAreaThumb = ({ ref, className, ...props }: ScrollAreaThumbProps & RefAttributes<HTMLDivElement>) => (
  <Thumb ref={ref} className={clsx('bg-grey-disabled relative flex-1 rounded-lg', className)} {...props} />
);

const ScrollAreaCorner = ({ ref, className, ...props }: ScrollAreaCornerProps & RefAttributes<HTMLDivElement>) => (
  <Corner ref={ref} className={clsx('bg-grey-background', className)} {...props} />
);

/**
 * Override hardcoded style to bypass https://github.com/radix-ui/primitives/issues/926
 */
const ScrollAreaViewport = ({ ref, className, ...props }: ScrollAreaViewportProps & RefAttributes<HTMLDivElement>) => (
  <Viewport ref={ref} className={clsx('overscroll-x-contain [&>:first-of-type]:block!', className)} {...props} />
);

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

type ScrollAreaElement = React.ElementRef<typeof Viewport>;
interface ScrollAreaV2Props
  extends React.ComponentPropsWithRef<typeof Root>,
    Omit<React.ComponentPropsWithRef<typeof Viewport>, 'dir'> {
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollAreaV2 = function ScrollAreaV2({
  ref: forwardedRef,
  className,
  type,
  scrollHideDelay,
  dir,
  orientation = 'vertical',
  ...viewportProps
}: ScrollAreaV2Props & { ref?: React.Ref<ScrollAreaElement> }) {
  return (
    <Root
      type={type}
      scrollHideDelay={scrollHideDelay}
      dir={dir}
      className={clsx('flex flex-col overflow-hidden', className)}
    >
      <Viewport
        {...viewportProps}
        ref={forwardedRef}
        // Override hardcoded style to bypass https://github.com/radix-ui/primitives/issues/926
        className="size-full overscroll-x-contain [&>:first-of-type]:block!"
      />

      {orientation !== 'vertical' ? (
        <Scrollbar
          orientation="horizontal"
          className="hover:bg-grey-border m-px flex h-1 touch-none select-none flex-col rounded-full transition-colors"
        >
          <Thumb className="bg-grey-disabled hover:bg-grey-placeholder flex-1 rounded-full" />
        </Scrollbar>
      ) : null}

      {orientation !== 'horizontal' ? (
        <Scrollbar
          orientation="vertical"
          className="hover:bg-grey-border m-px flex w-1 touch-none select-none flex-row rounded-full transition-colors"
        >
          <Thumb className="bg-grey-disabled hover:bg-grey-placeholder flex-1 rounded-full" />
        </Scrollbar>
      ) : null}

      {orientation === 'both' ? <Corner className="rounded-full" /> : null}
    </Root>
  );
};
