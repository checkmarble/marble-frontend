import * as Ariakit from '@ariakit/react';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const modalContentClassnames = cva(
  'bg-grey-00 fixed left-[50%] top-[50%] flex h-fit w-full translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg drop-shadow-xl',
  {
    variants: {
      size: {
        small: 'max-w-lg',
        medium: 'max-w-2xl',
        large: 'max-w-5xl',
      },
    },
  },
);

interface ModalContentProps
  extends Dialog.DialogContentProps,
    VariantProps<typeof modalContentClassnames> {}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ className, size = 'small', ...props }, ref) {
    return (
      <Dialog.Portal>
        <Dialog.Overlay className="animate-overlayShow bg-grey-100/20 fixed inset-0 flex items-center justify-center p-4" />
        <Dialog.Content
          ref={ref}
          {...props}
          className={modalContentClassnames({ size, className })}
        />
      </Dialog.Portal>
    );
  },
);

function ModalTitle(props: Dialog.DialogTitleProps) {
  return (
    <Dialog.Title
      className="border-b-grey-10 bg-grey-02 text-m rounded-t-lg border-b p-6 text-center font-bold"
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

interface ModalContentV2Props
  extends Ariakit.DialogProps,
    VariantProps<typeof modalContentClassnames> {}

export const ModalContentV2 = forwardRef<HTMLDivElement, ModalContentV2Props>(
  function ModalContentV2({ className, size = 'small', ...props }, ref) {
    return (
      <Ariakit.Dialog
        ref={ref}
        className={modalContentClassnames({ size, className })}
        backdrop={
          <div className="animate-overlayShow bg-grey-100/20 fixed inset-0 flex items-center justify-center p-4" />
        }
        {...props}
      />
    );
  },
);

export function ModalTitleV2(props: Ariakit.DialogHeadingProps) {
  return (
    <Ariakit.DialogHeading
      className="border-b-grey-10 bg-grey-02 text-m rounded-t-lg border-b p-6 text-center font-bold"
      {...props}
    />
  );
}

export const ModalV2 = {
  Root: Ariakit.DialogProvider,
  Trigger: Ariakit.DialogDisclosure,
  Close: Ariakit.DialogDismiss,
  Description: Ariakit.DialogDescription,
  Content: ModalContentV2,
  Title: ModalTitleV2,
};
