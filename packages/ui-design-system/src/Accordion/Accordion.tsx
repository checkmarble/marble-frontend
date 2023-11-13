import {
  Content,
  Header,
  Item,
  Root,
  Trigger,
} from '@radix-ui/react-accordion';
import clsx from 'clsx';
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

const AccordionTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Trigger asChild>
      <Header
        className={clsx(
          'group flex cursor-pointer items-center justify-between gap-4',
          className
        )}
      >
        {children}
        <Arrow2Down
          height="24px"
          width="24px"
          className="group-radix-state-closed:rotate-180 rounded transition-transform"
        />
      </Header>
    </Trigger>
  );
};

const AccordionContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Content asChild>
      <div
        className={clsx(
          'radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    </Content>
  );
};

export const Accordion = {
  Container: AccordionContainer,
  Item: Item,
  Title: AccordionTitle,
  Content: AccordionContent,
};
