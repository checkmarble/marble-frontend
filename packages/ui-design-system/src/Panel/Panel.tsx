import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createSharpFactory } from 'sharpstate';
import { Icon } from 'ui-icons';
import { cn } from '../utils';
import { PanelOverlay } from './PanelOverlay';

export type PanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'max';

const sizeClasses: Record<PanelSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  xxl: 'max-w-2xl',
  xxxl: 'max-w-3xl',
  max: 'max-w-[1000px]',
};

type OnOpenChangeFn = (state: boolean) => void;

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
    if (api.value.isControlled) {
      api.value.onOpenChange?.(false);
    } else {
      api.value.isOpen = false;
    }
  },
});

export function PanelRoot({ children, open, onOpenChange }: PanelRootProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  return (
    <PanelSharpFactory.Provider value={sharp}>
      {sharp.value.isOpen
        ? createPortal(
            <div className="fixed inset-0 z-20" ref={wrapperRef}>
              <PanelOverlay />
              {children}
            </div>,
            document.body,
          )
        : null}
    </PanelSharpFactory.Provider>
  );
}

interface PanelContainerProps {
  children: ReactNode;
  className?: string;
  size?: PanelSize;
}

export function PanelContainer({ children, className, size = 'md' }: PanelContainerProps) {
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

  return (
    <div
      ref={panelRef}
      className={cn(
        'fixed inset-y-0 z-20 right-0 bg-surface-card border-l border-grey-border p-v2-lg w-full flex flex-col animate-slideRightAndFadeIn',
        sizeClasses[size],
        className,
      )}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  children: ReactNode;
  className?: string;
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  const sharp = PanelSharpFactory.useSharp();

  return (
    <div className={cn('flex items-center justify-between pb-v2-md', className)}>
      <h2 className="text-l font-bold text-grey-primary">{children}</h2>
      <Icon
        icon="cross"
        className="size-5 cursor-pointer text-grey-secondary hover:text-grey-primary"
        onClick={sharp.actions.close}
        aria-label="Close panel"
      />
    </div>
  );
}

interface PanelContentProps {
  children: ReactNode;
  className?: string;
}

export function PanelContent({ children, className }: PanelContentProps) {
  return <div className={cn('flex-1 overflow-y-auto pb-v2-md', className)}>{children}</div>;
}

interface PanelFooterProps {
  children: ReactNode;
  className?: string;
}

export function PanelFooter({ children, className }: PanelFooterProps) {
  return <div className={cn('pt-v2-md border-t border-grey-border mt-auto', className)}>{children}</div>;
}
