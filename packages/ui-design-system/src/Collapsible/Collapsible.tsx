import {
  type CollapsibleContentProps,
  type CollapsibleProps,
  Content,
  Root,
  Trigger,
} from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { SmallarrowUp } from 'ui-icons';

const CollapsibleContainer = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, ...props }, ref) => {
    return (
      <Root
        defaultOpen={true}
        ref={ref}
        className={clsx(
          'border-grey-10 flex w-full flex-col overflow-hidden rounded-lg border',
          className
        )}
        {...props}
      />
    );
  }
);
CollapsibleContainer.displayName = 'CollapsibleContainer';

const CollapsibleTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Trigger asChild>
    <div
      className={clsx(
        'group flex cursor-pointer justify-between p-4 font-semibold lg:p-8',
        className
      )}
    >
      {children}
      <SmallarrowUp
        aria-hidden
        height="24px"
        width="24px"
        className="border-grey-10 group-radix-state-open:rotate-180 rounded border transition-transform duration-200"
      />
    </div>
  </Trigger>
);

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ children, className, ...props }, ref) {
    return (
      <Content
        className={clsx(
          'border-grey-10 border-t',
          'radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden',
          className
        )}
        {...props}
        ref={ref}
      >
        <div className="text-s p-4 lg:p-8">{children}</div>
      </Content>
    );
  }
);

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
};
