import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { forwardRef } from 'react';

type ModalContentProps = Dialog.DialogContentProps & {
  size?: 'small' | 'medium' | 'large';
};

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ className, size = 'small', ...props }, ref) {
    return (
      <Dialog.Portal>
        <Dialog.Overlay className="animate-overlayShow bg-grey-100/20 fixed inset-0 flex items-center justify-center p-4" />
        <Dialog.Content
          ref={ref}
          {...props}
          className={clsx(
            'border-grey-10 fixed left-[50%] top-[50%] flex h-fit w-full translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg border drop-shadow-xl',
            {
              'max-w-lg': size === 'small',
              'max-w-2xl': size === 'medium',
              'max-w-5xl': size === 'large',
            },
            className,
          )}
        />
      </Dialog.Portal>
    );
  },
);

function ModalTitle(props: Dialog.DialogTitleProps) {
  return (
    <Dialog.Title
      className="border-b-grey-10 bg-grey-02 text-m border-b px-8 py-6 text-center font-bold"
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
