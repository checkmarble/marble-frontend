import { createSimpleContext } from '@app-builder/utils/create-context';
import * as Dialog from '@radix-ui/react-dialog';
import { noop } from '@typescript-utils';
import { Cross } from '@ui-icons';
import clsx from 'clsx';
import { forwardRef } from 'react';

export type RightPanelContext = {
  open: boolean;
  onClose: () => void;
};

export interface RightPanelRootProps
  extends Omit<Dialog.DialogProps, 'open' | 'onOpenChange' | 'modal'>,
    RightPanelContext {
  className?: string;
}

export function createRightPanel(name: string) {
  const { Provider, useValue } = createSimpleContext<RightPanelContext>(name);

  function RightPanelRoot({
    open,
    onClose,
    className,
    ...otherProps
  }: RightPanelRootProps) {
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

  function RightPanelViewport({
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
        aria-hidden="true"
      >
        {children}
      </div>
    );
  }
  RightPanelViewport.displayName = `${name}Viewport`;

  const RightPanelTrigger = Dialog.Trigger;
  RightPanelTrigger.displayName = `${name}Trigger`;

  const RightPanelContent = forwardRef<
    HTMLDivElement,
    Dialog.DialogContentProps
  >(({ className, ...props }, ref) => {
    return (
      <Dialog.Content
        ref={ref}
        {...props}
        className={clsx(
          'bg-grey-00 absolute bottom-0 right-0 top-0 flex w-full flex-col shadow',
          'radix-state-open:animate-slideRightAndFadeIn radix-state-closed:animate-slideRightAndFadeOut',
          'gap-4 p-4 lg:gap-8 lg:p-8',
          className
        )}
      />
    );
  });
  RightPanelContent.displayName = `${name}Content`;

  function RightPanelTitle(props: Dialog.DialogTitleProps) {
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
  RightPanelTitle.displayName = `${name}Title`;

  function RightPanelClose() {
    const { onClose } = useValue();
    return (
      <Dialog.Close asChild onClick={onClose}>
        <button aria-label="Close">
          <Cross height="24px" width="24px" />
        </button>
      </Dialog.Close>
    );
  }
  RightPanelClose.displayName = `${name}Close`;

  return {
    RightPanel: {
      Root: RightPanelRoot,
      Viewport: RightPanelViewport,
      Trigger: RightPanelTrigger,
      Content: RightPanelContent,
      Title: RightPanelTitle,
      Close: RightPanelClose,
    },
    useRightPanelContext: useValue,
  };
}
