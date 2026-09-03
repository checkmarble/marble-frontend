import {
  type CollapsibleContentProps,
  type CollapsibleProps,
  Content,
  type CollapsibleTriggerProps as RadixCollapsibleProps,
  Root,
  Trigger,
} from '@radix-ui/react-collapsible';
import { cva, type VariantProps } from 'class-variance-authority';
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

const CollapsibleContainer = function CollapsibleContainer({
  ref,
  className,
  ...props
}: CollapsibleProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <HeadlessCollapsibleRoot
      defaultOpen={true}
      ref={ref}
      className={cn('border-grey-border flex w-full flex-col overflow-hidden rounded-lg border', className)}
      {...props}
    />
  );
};

const collapsibleSize = {
  default: 'p-md lg:p-lg',
  small: 'p-md',
  xs: 'p-xs',
  null: 'p-0',
};

const collapsibleTitle = cva('group flex cursor-pointer items-center justify-between gap-md font-semibold', {
  variants: {
    size: collapsibleSize,
  },
  defaultVariants: {
    size: 'default',
  },
});

const collapsibleContent = cva('', {
  variants: {
    size: collapsibleSize,
  },
  defaultVariants: {
    size: 'default',
  },
});

export type CollapsibleTriggerProps = VariantProps<typeof collapsibleTitle> & RadixCollapsibleProps;

const CollapsibleTitle = function CollapsibleTitle({
  ref,
  className,
  children,
  size,
  iconPosition = 'right',
  ...props
}: CollapsibleTriggerProps & {
  iconPosition?: 'hidden' | 'left' | 'right';
  ref?: React.Ref<HTMLButtonElement>;
}) {
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
};

const content =
  'border-grey-border border-t radix-state-open:animate-slide-down radix-state-closed:animate-slide-up overflow-hidden';

const CollapsibleContent = function CollapsibleContent({
  ref,
  children,
  className,
  size,
  ...props
}: VariantProps<typeof collapsibleContent> & CollapsibleContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Content className={cn(content, className)} {...props} ref={ref}>
      <div className={collapsibleContent({ size })}>{children}</div>
    </Content>
  );
};

export const Collapsible = {
  Container: CollapsibleContainer,
  Title: CollapsibleTitle,
  Content: CollapsibleContent,
};
