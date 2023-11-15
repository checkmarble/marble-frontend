import {
  type AccordionContentProps,
  type AccordionTriggerProps,
  Content,
  Header,
  Item,
  Root,
  Trigger,
} from '@radix-ui/react-accordion';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Arrow2Down } from 'ui-icons';

const AccordionContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Root
      type="multiple"
      className={clsx('flex flex-col gap-4 lg:gap-8 ', className)}
    >
      {children}
    </Root>
  );
};

const AccordionTitle = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTitle({ children, className, ...props }, ref) {
    return (
      <Header className="flex">
        <Trigger
          className={clsx(
            'group flex flex-1 cursor-pointer items-center justify-between gap-4',
            className
          )}
          {...props}
          ref={ref}
        >
          {children}
          <Arrow2Down
            aria-hidden
            height="24px"
            width="24px"
            className="group-radix-state-closed:rotate-180 rounded transition-transform"
          />
        </Trigger>
      </Header>
    );
  }
);

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ children, className, ...props }, ref) {
    return (
      <Content
        className={clsx(
          'radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden',
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
      </Content>
    );
  }
);

export const Accordion = {
  Container: AccordionContainer,
  Item: Item,
  Title: AccordionTitle,
  Content: AccordionContent,
};
