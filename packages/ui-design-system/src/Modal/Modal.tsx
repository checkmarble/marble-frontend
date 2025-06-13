import * as Ariakit from '@ariakit/react';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, type ReactNode } from 'react';

const modalContentClassnames = cva(
  'bg-grey-100 top-[10vh] flex w-full flex-col rounded-lg drop-shadow-xl overflow-hidden',
  {
    variants: {
      size: {
        small: 'max-w-lg',
        medium: 'max-w-2xl',
        large: 'max-w-5xl',
      },
      fixedHeight: {
        true: null,
        false: 'h-fit',
      },
    },
  },
);

interface ModalContentProps
  extends Dialog.DialogContentProps,
    VariantProps<typeof modalContentClassnames> {}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(function ModalContent(
  { className, size = 'small', ...props },
  ref,
) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="animate-overlayShow bg-grey-00/20 fixed inset-0 z-[98] flex items-center justify-center p-4 backdrop-blur-sm" />
      <Dialog.Content
        ref={ref}
        {...props}
        className={modalContentClassnames({
          size,
          className: clsx('fixed left-1/2 z-[99] -translate-x-1/2', className),
        })}
      />
    </Dialog.Portal>
  );
});

function ModalTitle(props: Dialog.DialogTitleProps) {
  return (
    <Dialog.Title
      className="border-b-grey-90 bg-grey-98 text-m rounded-t-lg border-b p-6 text-center font-bold"
      {...props}
    />
  );
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="shadow-sticky-bottom sticky bottom-0">{children}</div>;
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

export interface ModalContentV2Props
  extends Ariakit.DialogProps,
    VariantProps<typeof modalContentClassnames> {}

export const ModalContentV2 = forwardRef<HTMLDivElement, ModalContentV2Props>(
  function ModalContentV2({ className, size = 'small', fixedHeight, ...props }, ref) {
    return (
      <Ariakit.Dialog
        ref={ref}
        className={modalContentClassnames({
          size,
          fixedHeight,
          className: clsx(
            'z-50 scale-95 opacity-0 transition-all data-[enter]:scale-100 data-[enter]:opacity-100',
            className,
          ),
        })}
        backdrop={
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-grey-00/20 fixed inset-0 flex items-center justify-center p-4 opacity-0 backdrop-blur-sm transition-all data-[enter]:opacity-100"
          />
        }
        unmountOnHide
        render={({ className, ...p }) => (
          <div className={clsx(className, 'fixed left-1/2 -translate-x-1/2')} {...p} />
        )}
        {...props}
      />
    );
  },
);

export function ModalTitleV2(props: Ariakit.DialogHeadingProps) {
  return (
    <Ariakit.DialogHeading
      className="border-b-grey-90 bg-grey-98 text-m rounded-t-lg border-b p-6 text-center font-bold"
      {...props}
    />
  );
}

/**
 * @deprecated Use `Modal` instead.
 */
export const ModalV2 = {
  Root: Ariakit.DialogProvider,
  Trigger: Ariakit.DialogDisclosure,
  Close: Ariakit.DialogDismiss,
  Description: Ariakit.DialogDescription,
  Content: ModalContentV2,
  Title: ModalTitleV2,
  Footer: ModalFooter,
};
