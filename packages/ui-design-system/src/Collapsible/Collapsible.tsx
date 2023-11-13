import {
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
          'border-grey-10 flex w-full flex-col rounded-lg border',
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
        height="24px"
        width="24px"
        className="border-grey-10 group-radix-state-open:rotate-180 rounded border transition-transform"
      />
    </div>
  </Trigger>
);

const CollapsibleContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Content asChild>
    <div
      className={clsx(
        'text-s border-grey-10 border-t p-4 lg:p-8',
        'radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  </Content>
);

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
};
