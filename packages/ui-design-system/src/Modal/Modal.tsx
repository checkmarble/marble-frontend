import { composeRefs } from '@radix-ui/react-compose-refs';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { createContext, forwardRef, type ReactNode, useContext, useState } from 'react';
import { typoClassName } from '../Typography/Typo';
import { cn } from '../utils';
import { useScrollBorders } from './modal-scroll';

type ModalScrollState = {
  showTitleBorder: boolean;
  showFooterBorder: boolean;
};

const ModalScrollContext = createContext<ModalScrollState>({
  showTitleBorder: false,
  showFooterBorder: false,
});

function useModalScroll() {
  return useContext(ModalScrollContext);
}

const modalContentClassnames = cva(
  'bg-surface-card top-[10vh] flex w-full flex-col rounded-lg drop-shadow-xl overflow-x-hidden overflow-y-auto max-h-[80vh]',
  {
    variants: {
      size: {
        small: 'max-w-lg',
        medium: 'max-w-2xl',
        large: 'max-w-5xl',
        xlarge: 'max-w-7xl',
        full: 'max-w-[90vw]',
      },
      fixedHeight: {
        true: null,
        false: 'h-fit',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  },
);

interface ModalContentProps extends Dialog.DialogContentProps, VariantProps<typeof modalContentClassnames> {}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(function ModalContent(
  { className, size, fixedHeight, children, ...props },
  ref,
) {
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);
  const scrollState = useScrollBorders(contentElement);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs" />
      <Dialog.Content
        ref={composeRefs(ref, setContentElement)}
        {...props}
        className={modalContentClassnames({
          size,
          fixedHeight,
          className: cn('fixed left-1/2 z-50 -translate-x-1/2', className),
        })}
      >
        <ModalScrollContext.Provider value={scrollState}>{children}</ModalScrollContext.Provider>
      </Dialog.Content>
    </Dialog.Portal>
  );
});
ModalContent.displayName = 'ModalContent';

const ModalTitle = forwardRef<HTMLHeadingElement, Dialog.DialogTitleProps>(function ModalTitle(
  { className, ...props },
  ref,
) {
  const { showTitleBorder } = useModalScroll();

  return (
    <Dialog.Title
      ref={ref}
      className={typoClassName({
        variant: 'title2',
        className: cn(
          'sticky top-0 z-10 border-b  p-4 bg-surface-card',
          showTitleBorder ? 'border-b-grey-border shadow-sticky-top' : 'border-transparent',
          className,
        ),
      })}
      {...props}
    />
  );
});
ModalTitle.displayName = 'ModalTitle';

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  const { showFooterBorder } = useModalScroll();

  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 border-t bg-surface-card flex justify-end gap-v2-sm p-v2-md',
        showFooterBorder ? 'border-t-grey-border shadow-sticky-bottom' : 'border-transparent',
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
