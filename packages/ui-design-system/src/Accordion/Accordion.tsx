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
import { forwardRef, type SVGProps } from 'react';
import { Icon } from 'ui-icons';

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
      className={clsx('flex flex-col gap-4 lg:gap-6', className)}
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

export const AccordionArrow = forwardRef<
  SVGSVGElement,
  SVGProps<SVGSVGElement>
>(function AccordionArrow({ className, ...props }, ref) {
  return (
    <Icon
      icon="arrow-2-down"
      aria-hidden
      className={clsx(
        'group-radix-state-closed:rotate-180 h-6 w-6 rounded transition-transform',
        className,
      )}
      {...props}
      ref={ref}
    />
  );
});

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
