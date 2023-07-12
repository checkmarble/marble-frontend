import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const ModalContent = forwardRef<
  HTMLDivElement,
  Dialog.DialogContentProps
>(({ className, ...props }, ref) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="animate-overlayShow bg-grey-100/20 fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Content
          ref={ref}
          {...props}
          className={clsx(
            'border-grey-10 flex h-fit w-full max-w-lg flex-col overflow-hidden rounded-lg border drop-shadow-xl',
            className
          )}
        />
      </Dialog.Overlay>
    </Dialog.Portal>
  );
});

function ModalTitle(props: Dialog.DialogTitleProps) {
  return (
    <Dialog.Title
      className="text-m border-b-grey-10 bg-grey-02 border-b px-8 py-6 text-center font-bold"
      {...props}
    />
  );
}

export const Modal = {
  Root: Dialog.Root,
  Trigger: Dialog.Trigger,
  Close: Dialog.Close,
  Description: Dialog.Description,
  Content: ModalContent,
  Title: ModalTitle,
};
