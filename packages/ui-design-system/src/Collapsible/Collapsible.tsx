import {
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  Content,
  Root,
  Trigger,
} from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';

const CollapsibleContainer = forwardRef<HTMLDivElement, CollapsibleProps>(
  function CollapsibleContainer({ className, ...props }, ref) {
    return (
      <Root
        defaultOpen={true}
        ref={ref}
        className={clsx(
          'border-grey-10 flex w-full flex-col overflow-hidden rounded-lg border',
          className,
        )}
        {...props}
      />
    );
  },
);

const CollapsibleTitle = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTitle({ className, children, ...props }, ref) {
    return (
      <Trigger
        ref={ref}
        className={clsx(
          'group flex cursor-pointer items-center justify-between gap-4 p-4 font-semibold lg:p-6',
          className,
        )}
        asChild
        {...props}
      >
        <div>
          {children}
          <Icon
            icon="smallarrow-up"
            aria-hidden
            className="border-grey-10 group-radix-state-open:rotate-180 size-6 rounded border transition-transform duration-200"
          />
        </div>
      </Trigger>
    );
  },
);

const content =
  'border-grey-10 border-t radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden';

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ children, className, ...props }, ref) {
    return (
      <Content className={clsx(content, className)} {...props} ref={ref}>
        <div className="text-s p-4 lg:p-6">{children}</div>
      </Content>
    );
  },
);

const CollapsibleScrollableContent = forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleScrollableContent(
  { children, className, ...props },
  ref,
) {
  return (
    <Content className={content} {...props} ref={ref}>
      <ScrollAreaV2 className={className}>
        <div className="text-s p-4 lg:p-6">{children}</div>
      </ScrollAreaV2>
    </Content>
  );
});

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
  ScrollableContent: CollapsibleScrollableContent,
};
