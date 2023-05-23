import { createSimpleContext } from '@marble-front/builder/utils/create-context';
import { noop } from '@marble-front/typescript-utils';
import { Cross } from '@marble-front/ui/icons';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { forwardRef } from 'react';

export type RightPannelContext = {
  open: boolean;
  onClose: () => void;
};

export interface RightPannelRootProps
  extends Omit<Dialog.DialogProps, 'open' | 'onOpenChange' | 'modal'>,
    RightPannelContext {
  className?: string;
}

export function createRightPannel(name: string) {
  const { Provider, useValue } = createSimpleContext<RightPannelContext>(name);

  function RightPannelRoot({
    open,
    onClose,
    className,
    ...otherProps
  }: RightPannelRootProps) {
    const value = { open, onClose };
    return (
      <div className={clsx('relative flex h-full w-full', className)}>
        <Provider value={value}>
          <Dialog.Root
            modal={false}
            open={open}
            onOpenChange={noop}
            {...otherProps}
          />
        </Provider>
      </div>
    );
  }

  function RightPannelViewport({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    const { open, onClose } = useValue();
    return (
      <div
        onClick={() => {
          if (open) {
            onClose();
          }
        }}
        className={clsx('flex h-full w-full', className)}
      >
        {children}
      </div>
    );
  }
  RightPannelViewport.displayName = `${name}Viewport`;

  const RightPannelTrigger = Dialog.Trigger;
  RightPannelTrigger.displayName = `${name}Trigger`;

  const RightPannelContent = forwardRef<
    HTMLDivElement,
    Dialog.DialogContentProps
  >(({ className, ...props }, ref) => {
    return (
      <Dialog.Content
        ref={ref}
        {...props}
        className={clsx(
          'bg-grey-00 absolute right-0 top-0 bottom-0 flex w-full flex-col shadow',
          'radix-state-open:animate-slideRightAndFadeIn radix-state-closed:animate-slideRightAndFadeOut',
          'gap-4 p-4 lg:gap-8 lg:p-8',
          className
        )}
      />
    );
  });
  RightPannelContent.displayName = `${name}Content`;

  function RightPannelTitle(props: Dialog.DialogTitleProps) {
    return (
      <Dialog.Title
        {...props}
        className={clsx(
          'text-grey-100 text-l flex flex-row items-center gap-2 font-bold',
          props.className
        )}
      />
    );
  }
  RightPannelTitle.displayName = `${name}Title`;

  function RightPannelClose() {
    const { onClose } = useValue();
    return (
      <Dialog.Close asChild onClick={onClose}>
        <button aria-label="Close">
          <Cross height="24px" width="24px" />
        </button>
      </Dialog.Close>
    );
  }
  RightPannelClose.displayName = `${name}Close`;

  return {
    RightPannel: {
      Root: RightPannelRoot,
      Viewport: RightPannelViewport,
      Trigger: RightPannelTrigger,
      Content: RightPannelContent,
      Title: RightPannelTitle,
      Close: RightPannelClose,
    },
    useRightPannelContext: useValue,
  };
}
