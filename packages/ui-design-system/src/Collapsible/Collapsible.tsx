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
import { SmallarrowUp } from 'ui-icons';

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
        {...props}
      >
        {children}
        <SmallarrowUp
          aria-hidden
          height="24px"
          width="24px"
          className="border-grey-10 group-radix-state-open:rotate-180 rounded border transition-transform duration-200"
        />
      </Trigger>
    );
  },
);

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ children, className, ...props }, ref) {
    return (
      <Content
        className={clsx(
          'border-grey-10 border-t',
          'radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden',
          className,
        )}
        {...props}
        ref={ref}
      >
        <div className="text-s p-4 lg:p-6">{children}</div>
      </Content>
    );
  },
);

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
};
