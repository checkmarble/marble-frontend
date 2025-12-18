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

const HeadlessCollapsibleRoot = Root;
const HeadlessCollapsibleTrigger = Trigger;
const HeadlessCollapsibleContent = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Content className="radix-state-open:animate-slide-down radix-state-closed:animate-slide-up overflow-hidden">
      {children}
    </Content>
  );
};

export const HeadlessCollapsible = {
  Root: HeadlessCollapsibleRoot,
  Trigger: HeadlessCollapsibleTrigger,
  Content: HeadlessCollapsibleContent,
};

const CollapsibleContainer = forwardRef<HTMLDivElement, CollapsibleProps>(function CollapsibleContainer(
  { className, ...props },
  ref,
) {
  return (
    <HeadlessCollapsibleRoot
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
    <HeadlessCollapsibleTrigger ref={ref} className={collapsibleTitle({ size, className })} asChild {...props}>
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
    </HeadlessCollapsibleTrigger>
  );
});

const content =
  'border-grey-border border-t radix-state-open:animate-slide-down radix-state-closed:animate-slide-up overflow-hidden';

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(function CollapsibleContent(
  { children, className, ...props },
  ref,
) {
  return (
    <Content className={content} {...props} ref={ref}>
      <div className={cn('text-s p-md lg:p-lg', className)}>{children}</div>
    </Content>
  );
});

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
};
