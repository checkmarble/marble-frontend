import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconProps } from 'packages/ui-icons/src/Icon';
import { forwardRef, type ReactNode } from 'react';
import { match } from 'ts-pattern';
import { Icon } from 'ui-icons';
import { Button, CtaV2ClassName } from '../Button/Button';
import { StickyComponent } from '../StickyComponent/StickyComponent';
import { typoClassName } from '../Typography/Typo';
import { cn } from '../utils';

function ModalRoot(props: Dialog.DialogProps) {
  return <Dialog.Root {...props} />;
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
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-50 flex items-center justify-center p-md backdrop-blur-xs" />
      <Dialog.Content
        ref={ref}
        {...props}
        className={modalContentClassnames({
          size,
          fixedHeight,
          className: cn('fixed left-1/2 z-50 -translate-x-1/2', className),
        })}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
});
ModalContent.displayName = 'ModalContent';

const ModalTitle = forwardRef<HTMLHeadingElement, Dialog.DialogTitleProps>(function ModalTitle(
  { className, ...props },
  ref,
) {
  return (
    <StickyComponent inFlow>
      <Dialog.Title
        ref={ref}
        className={typoClassName({
          variant: 'title2',
          className: cn(
            'sticky top-0 z-10 border-b border-transparent p-md bg-surface-card sentinel-intersect:border-b-grey-border sentinel-intersect:shadow-sticky-top',
            className,
          ),
        })}
        {...props}
      />
    </StickyComponent>
  );
});
ModalTitle.displayName = 'ModalTitle';

type ModalButtonVariant = Extract<
  VariantProps<typeof CtaV2ClassName>['variant'],
  'primary' | 'destructive' | 'secondary'
>;
type ModalButtonAppearance = Extract<VariantProps<typeof CtaV2ClassName>['appearance'], 'stroked' | 'filled'>;

interface ModalFooterProps {
  children?: ReactNode;
  className?: string;
}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(function ModalFooter({ children, className }, ref) {
  return (
    <StickyComponent inFlow>
      <div
        ref={ref}
        className={cn(
          'sticky bottom-0 z-10 border-t border-transparent bg-surface-card flex justify-end gap-sm p-md sentinel-intersect:border-t-grey-border sentinel-intersect:shadow-sticky-bottom',
          className,
        )}
      >
        {children}
      </div>
    </StickyComponent>
  );
});
ModalFooter.displayName = 'ModalFooter';

type ModalFooterButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant' | 'appearance' | 'size'> & {
  label: string;
  variant?: ModalButtonVariant;
  isCloseButton?: boolean;
  isLoading?: boolean;
  leadingIcon?: IconProps['icon'];
  trailingIcon?: IconProps['icon'];
  children?: ReactNode;
};

const ModalFooterButton = forwardRef<HTMLButtonElement, ModalFooterButtonProps>(function ModalFooterButton(
  { variant, isCloseButton, isLoading, leadingIcon, trailingIcon, disabled, label, children, className, ...props },
  ref,
) {
  const { variant: buttonVariant, appearance } = match(variant)
    .with('secondary', () => ({
      variant: 'secondary' as ModalButtonVariant,
      appearance: 'stroked' as ModalButtonAppearance,
    }))
    .with('destructive', () => ({
      variant: 'destructive' as ModalButtonVariant,
      appearance: 'filled' as ModalButtonAppearance,
    }))
    .otherwise(() => ({
      variant: (isCloseButton ? (variant ?? 'secondary') : 'primary') as ModalButtonVariant,
      appearance: (isCloseButton && variant !== 'primary' ? 'stroked' : 'filled') as ModalButtonAppearance,
    }));
  const button = (
    <Button
      ref={ref}
      variant={buttonVariant}
      appearance={appearance}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || isLoading || undefined}
      size="large"
      className={cn(isLoading && 'pointer-events-none', className)}
      {...props}
    >
      {leadingIcon ? (
        isLoading ? (
          <Icon icon="spinner" className="size-5 animate-spin" />
        ) : (
          <Icon icon={leadingIcon} className="size-5" />
        )
      ) : null}
      {label}
      {children}
      {trailingIcon ? (
        isLoading && !leadingIcon ? (
          <Icon icon="spinner" className="size-5 animate-spin" />
        ) : (
          <Icon icon={trailingIcon} className="size-5" />
        )
      ) : null}
      {isLoading && !leadingIcon && !trailingIcon ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
    </Button>
  );

  if (isCloseButton) {
    return <Dialog.Close asChild>{button}</Dialog.Close>;
  }

  return button;
});

ModalFooterButton.displayName = 'ModalFooterButton';

export const Modal = {
  Root: ModalRoot,
  Trigger: Dialog.Trigger,
  Close: Dialog.Close,
  Description: Dialog.Description,
  Content: ModalContent,
  Title: ModalTitle,
  Footer: ModalFooter,
  FooterButton: ModalFooterButton,
};
