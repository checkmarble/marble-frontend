import { Corner, Root, Scrollbar, Thumb, Viewport } from '@radix-ui/react-scroll-area';
import { cn } from '../utils';

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
      className={cn('flex flex-col overflow-hidden', className)}
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
