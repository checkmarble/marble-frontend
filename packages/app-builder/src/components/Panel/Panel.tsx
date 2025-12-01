import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { usePanel } from './PanelProvider';

export type PanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const sizeClasses: Record<PanelSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  xxl: 'max-w-2xl',
};

interface PanelContainerProps {
  children: ReactNode;
  className?: string;
  size?: PanelSize;
}

export function PanelContainer({ children, className, size = 'md' }: PanelContainerProps) {
  const { closePanel } = usePanel();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePanel]);

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
        'fixed inset-y-0 right-0 bg-grey-100 border-l border-grey-border p-v2-lg w-full flex flex-col animate-slideRightAndFadeIn',
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
  const { closePanel } = usePanel();

  return (
    <div className={cn('flex items-center justify-between pb-v2-md', className)}>
      <h2 className="text-l font-bold text-grey-00">{children}</h2>
      <Icon
        icon="cross"
        className="size-5 cursor-pointer text-grey-50 hover:text-grey-00"
        onClick={closePanel}
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
