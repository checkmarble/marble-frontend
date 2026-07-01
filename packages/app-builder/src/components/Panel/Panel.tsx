import { Slot } from '@radix-ui/react-slot';
import { VariantProps } from 'class-variance-authority';
import { IconProps } from 'packages/ui-icons/src/Icon';
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createSharpFactory } from 'sharpstate';
import { match } from 'ts-pattern';
import { Button, CtaV2ClassName, cn, StickyComponent, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelOverlay } from './PanelOverlay';

export type PanelSize = 'small' | 'medium' | 'large';

const sizeClasses: Record<PanelSize, string> = {
  small: 'max-w-[calc(100vw_/_3)]',
  medium: 'max-w-[50vw]',
  large: 'max-w-[calc(100vw_*_(2_/_3))]',
};

type OnOpenChangeFn = (state: boolean) => boolean | void;

interface PanelRootProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: OnOpenChangeFn;
}

type PanelSharpInitParams = {
  open: boolean | undefined;
  onOpenChange: OnOpenChangeFn | undefined;
};

export const PanelSharpFactory = createSharpFactory({
  name: 'Panel',
  initializer: (params: PanelSharpInitParams) => {
    const isControlled = params.open !== undefined;

    return {
      isOpen: !!params.open,
      onOpenChange: params.onOpenChange,
      isControlled,
    };
  },
}).withActions({
  open(api) {
    if (api.value.isControlled) {
      api.value.onOpenChange?.(true);
    } else {
      api.value.isOpen = true;
    }
  },
  close(api) {
    if (api.value.onOpenChange?.(false) === false) {
      return;
    }

    if (!api.value.isControlled) {
      api.value.isOpen = false;
    }
  },
});

function PanelRoot({ children, open, onOpenChange }: PanelRootProps) {
  const sharp = PanelSharpFactory.createSharp({
    open,
    onOpenChange,
  });

  useEffect(() => {
    if (!sharp.value.isControlled && open !== undefined) {
      console.warn(`Panel was initialized as uncontrolled but has its value change to ${open}`);
    }
    sharp.value.isOpen = !!open;
  }, [sharp, open]);

  useEffect(() => {
    sharp.value.onOpenChange = onOpenChange;
  }, [onOpenChange, sharp]);

  return <PanelSharpFactory.Provider value={sharp}>{children}</PanelSharpFactory.Provider>;
}

interface PanelTriggerProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
}

const PanelTrigger = forwardRef<HTMLButtonElement, PanelTriggerProps>(function PanelTrigger(
  { asChild, onClick, ...props },
  ref,
) {
  const sharp = PanelSharpFactory.useSharp();
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : 'button'}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          sharp.actions.open();
        }
      }}
    />
  );
});
PanelTrigger.displayName = 'PanelTrigger';

interface PanelContainerProps {
  children: ReactNode;
  className?: string;
  size?: PanelSize;
}

function PanelContainer({ children, className, size = 'small' }: PanelContainerProps) {
  const sharp = PanelSharpFactory.useSharp();

  if (!sharp.value.isOpen) {
    return null;
  }

  return (
    <PanelContainerPortal className={className} size={size}>
      {children}
    </PanelContainerPortal>
  );
}

function PanelContainerPortal({ children, className, size = 'small' }: PanelContainerProps) {
  const sharp = PanelSharpFactory.useSharp();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        sharp.actions.close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sharp]);

  // Focus trap = when panel is open, pressing Tab keeps focus inside the panel
  // (can't tab to elements behind it).
  // It's an accessibility best practice for modals/dialogs
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    // Focus first element on mount
    firstElement?.focus();

    panel.addEventListener('keydown', handleTabKey);
    return () => panel.removeEventListener('keydown', handleTabKey);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-20">
      <PanelOverlay />
      <div
        ref={panelRef}
        className={cn(
          'fixed inset-y-0 z-20 right-0 bg-surface-card border-l border-grey-border w-full flex flex-col animate-slideRightAndFadeIn overflow-y-auto',
          sizeClasses[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface PanelHeaderProps {
  children: ReactNode;
  className?: string;
}

function PanelHeader({ children, className }: PanelHeaderProps) {
  const sharp = PanelSharpFactory.useSharp();

  return (
    <StickyComponent sentinelClassName="h-0 top-0">
      <div
        className={cn(
          'sticky top-0 -m-lg mb-0 p-lg flex gap-md items-center bg-surface-card z-1 border-b border-transparent sentinel-intersect:border-grey-border sentinel-intersect:shadow-sticky-top',
        )}
      >
        <Icon
          icon="x"
          className="size-6 cursor-pointer text-grey-secondary hover:text-grey-primary"
          onClick={sharp.actions.close}
          aria-label="Close panel"
        />
        <Typo as="div" variant="title2" className={cn('grow', className)}>
          {children}
        </Typo>
      </div>
    </StickyComponent>
  );
}

interface PanelContentProps {
  children: ReactNode;
  className?: string;
}

export function PanelContent({ children, className }: PanelContentProps) {
  return <div className={cn('relative min-h-screen p-lg flex flex-col grow', className)}>{children}</div>;
}

interface PanelFooterProps {
  children: ReactNode;
  className?: string;
}

function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <StickyComponent inFlow="after" sentinelClassName="top-lg -translate-y-2xs">
      <div
        className={cn(
          'sticky flex justify-end gap-md bottom-0 bg-surface-card -m-lg mt-auto p-lg border-t border-transparent sentinel-intersect:border-grey-border sentinel-intersect:shadow-sticky-bottom',
          className,
        )}
      >
        {children}
      </div>
    </StickyComponent>
  );
}

type PanelButtonVariant = Extract<
  VariantProps<typeof CtaV2ClassName>['variant'],
  'primary' | 'destructive' | 'secondary'
>;
type PanelButtonAppearance = Extract<VariantProps<typeof CtaV2ClassName>['appearance'], 'stroked' | 'filled'>;

type PanelFooterButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant' | 'appearance' | 'size'> & {
  label: string;
  variant?: PanelButtonVariant;
  isCloseButton?: boolean;
  isLoading?: boolean;
  leadingIcon?: IconProps['icon'];
  trailingIcon?: IconProps['icon'];
  children?: ReactNode;
};

const PanelFooterButton = forwardRef<HTMLButtonElement, PanelFooterButtonProps>(function PanelFooterButton(
  {
    variant,
    isCloseButton,
    isLoading,
    leadingIcon,
    trailingIcon,
    disabled,
    label,
    children,
    className,
    onClick,
    ...props
  },
  ref,
) {
  const sharp = PanelSharpFactory.useSharp();

  const { variant: buttonVariant, appearance } = match(variant)
    .with('secondary', () => ({
      variant: 'secondary' as PanelButtonVariant,
      appearance: 'stroked' as PanelButtonAppearance,
    }))
    .with('destructive', () => ({
      variant: 'destructive' as PanelButtonVariant,
      appearance: 'filled' as PanelButtonAppearance,
    }))
    .otherwise(() => ({
      variant: (isCloseButton ? (variant ?? 'secondary') : 'primary') as PanelButtonVariant,
      appearance: (isCloseButton && variant !== 'primary' ? 'stroked' : 'filled') as PanelButtonAppearance,
    }));

  return (
    <Button
      ref={ref}
      variant={buttonVariant}
      appearance={appearance}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || isLoading || undefined}
      size="large"
      className={cn(isLoading && 'pointer-events-none', className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && isCloseButton) {
          sharp.actions.close();
        }
      }}
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
});
PanelFooterButton.displayName = 'PanelFooterButton';

export const Panel = {
  Root: PanelRoot,
  Trigger: PanelTrigger,
  Container: PanelContainer,
  Content: PanelContent,
  Header: PanelHeader,
  Footer: PanelFooter,
  FooterButton: PanelFooterButton,
};
