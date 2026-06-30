import {
  type CollapsibleContentProps,
  type CollapsibleProps,
  Content,
  type CollapsibleTriggerProps as RadixCollapsibleProps,
  Root,
  Trigger,
} from '@radix-ui/react-collapsible';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';
import { cn } from '../utils';

const CollapsibleContainer = forwardRef<HTMLDivElement, CollapsibleProps>(function CollapsibleContainer(
  { className, ...props },
  ref,
) {
  return (
    <Root
      defaultOpen={true}
      ref={ref}
      className={clsx('border-grey-border flex w-full flex-col overflow-hidden rounded-lg border', className)}
      {...props}
    />
  );
});

const collapsibleTitle = cva('group flex cursor-pointer items-center justify-between gap-md font-semibold', {
  variants: {
    size: {
      default: 'p-md lg:p-lg',
      small: 'p-md',
      null: 'p-0',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type CollapsibleTriggerProps = VariantProps<typeof collapsibleTitle> & RadixCollapsibleProps;

const CollapsibleTitle = forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps & { iconPosition?: 'hidden' | 'left' | 'right' }
>(function CollapsibleTitle({ className, children, size, iconPosition = 'right', ...props }, ref) {
  return (
    <Trigger ref={ref} className={collapsibleTitle({ size, className })} asChild {...props}>
      <div
        className={cn(
          'focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-purple-primary',
          iconPosition === 'left' && 'grid grid-cols-[auto_1fr]',
        )}
      >
        {iconPosition === 'left' ? (
          <>
            <Icon
              icon="smallarrow-up"
              aria-hidden
              className=" group-radix-state-open:rotate-180 size-6 rounded-sm  transition-transform duration-200 self-start"
            />
            <div>{children}</div>
          </>
        ) : (
          children
        )}
        {iconPosition === 'right' && (
          <Icon
            icon="smallarrow-up"
            aria-hidden
            className="border-grey-border group-radix-state-open:rotate-180 size-6 rounded-sm border transition-transform duration-200"
          />
        )}
      </div>
    </Trigger>
  );
});

const content =
  'border-grey-border border-t radix-state-open:animate-slide-down radix-state-closed:animate-slide-up overflow-hidden';

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(function CollapsibleContent(
  { children, className, ...props },
  ref,
) {
  return (
    <Content className={clsx(content, className)} {...props} ref={ref}>
      <div className="text-s p-md lg:p-lg">{children}</div>
    </Content>
  );
});

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
};
