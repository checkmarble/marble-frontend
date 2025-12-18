import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, type ReactNode } from 'react';

const modalContentClassnames = cva(
  'bg-surface-card top-[10vh] flex w-full flex-col rounded-lg drop-shadow-xl overflow-hidden',
  {
    variants: {
      size: {
        small: 'max-w-lg',
        medium: 'max-w-2xl',
        large: 'max-w-5xl',
        xlarge: 'max-w-7xl',
      },
      fixedHeight: {
        true: null,
        false: 'h-fit',
      },
    },
  },
);

interface ModalContentProps extends Dialog.DialogContentProps, VariantProps<typeof modalContentClassnames> {}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(function ModalContent(
  { className, size = 'small', ...props },
  ref,
) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs" />
      <Dialog.Content
        ref={ref}
        {...props}
        className={modalContentClassnames({
          size,
          className: clsx('fixed left-1/2 z-50 -translate-x-1/2', className),
        })}
      />
    </Dialog.Portal>
  );
});

function ModalTitle(props: Dialog.DialogTitleProps) {
  return (
    <Dialog.Title className="mx-v2-md mt-v2-md h-8 text-h2 font-semibold flex gap-v2-sm items-center" {...props} />
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={clsx(
        'border-t-grey-border bg-surface-card sticky bottom-0 flex justify-end gap-v2-sm border-t p-v2-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Modal = {
  Root: Dialog.Root,
  Trigger: Dialog.Trigger,
  Close: Dialog.Close,
  Description: Dialog.Description,
  Content: ModalContent,
  Title: ModalTitle,
  Footer: ModalFooter,
};
