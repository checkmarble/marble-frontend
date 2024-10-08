import * as Ariakit from '@ariakit/react';
import {
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  Content,
  Root,
  Trigger,
} from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import * as React from 'react';
import { forwardRef } from 'react';
import { Icon } from 'ui-icons';

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
        asChild
        {...props}
      >
        <div>
          {children}
          <Icon
            icon="smallarrow-up"
            aria-hidden
            className="border-grey-10 group-radix-state-open:rotate-180 size-6 rounded border transition-transform duration-200"
          />
        </div>
      </Trigger>
    );
  },
);

const content =
  'border-grey-10 border-t radix-state-open:animate-slideDown radix-state-closed:animate-slideUp overflow-hidden';

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ children, className, ...props }, ref) {
    return (
      <Content className={clsx(content, className)} {...props} ref={ref}>
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

// Workaround: see https://github.com/ariakit/ariakit/issues/3835
const DefaultOpenContext = React.createContext(false);

function CollapsibleV2Provider({
  defaultOpen = false,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [initialRender, setInitialRender] = React.useState(defaultOpen);
  return (
    <Ariakit.DisclosureProvider
      open={open}
      setOpen={(open) => {
        setOpen(open);
        setInitialRender(false);
      }}
    >
      <DefaultOpenContext.Provider value={initialRender}>
        {children}
      </DefaultOpenContext.Provider>
    </Ariakit.DisclosureProvider>
  );
}

const CollapsibleV2Title = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<'button'>
>(function CollapsibleV2Title(props, ref) {
  const initialRender = React.useContext(DefaultOpenContext);
  return (
    <Ariakit.Disclosure
      ref={ref}
      data-initial={initialRender || undefined}
      {...props}
    />
  );
});

/**
 * Animated collapsible content.
 * `className` is used for container. Any content should be styled using the `children` prop.
 *
 * @see https://ariakit.org/components/disclosure
 */
const CollapsibleV2Content = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>(function CollapsibleV2Content({ className, ...props }, ref) {
  const initialRender = React.useContext(DefaultOpenContext);
  return (
    <Ariakit.DisclosureContent
      ref={ref}
      data-initial={initialRender || undefined}
      className={clsx(
        'col-span-full grid grid-rows-[0fr] transition-all duration-200 data-[enter]:grid-rows-[1fr] data-[initial]:grid-rows-[1fr]',
        className,
      )}
    >
      <div className="overflow-hidden" {...props} />
    </Ariakit.DisclosureContent>
  );
});

export const CollapsibleV2 = {
  Provider: CollapsibleV2Provider,
  Title: CollapsibleV2Title,
  Content: CollapsibleV2Content,
};
