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
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
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
      className={clsx('flex flex-col gap-4 lg:gap-8', className)}
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
          className={clsx('group cursor-pointer', className)}
          {...props}
          ref={ref}
        >
          {children}
        </Trigger>
      </Header>
    );
  },
);

function AccordionArrow({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Arrow2Down>) {
  return (
    <Arrow2Down
      aria-hidden
      height="24px"
      width="24px"
      className={clsx(
        'group-radix-state-closed:rotate-180 rounded transition-transform',
        className,
      )}
      {...props}
    />
  );
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ children, className, ...props }, ref) {
    return (
      <Content
        className={clsx(
          'radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden',
          className,
        )}
        {...props}
        ref={ref}
      >
        {children}
      </Content>
    );
  },
);

export const Accordion = {
  Container: AccordionContainer,
  Item: Item,
  Title: AccordionTitle,
  Arrow: AccordionArrow,
  Content: AccordionContent,
};
