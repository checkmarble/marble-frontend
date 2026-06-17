import { useComposedRefs } from '@radix-ui/react-compose-refs';
import {
  PopoverAnchor,
  PopoverContent as PopoverContentPrimitive,
  type PopoverContentProps,
  PopoverPortal,
  Popover as PopoverPrimitive,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { createContext, forwardRef, type ReactNode, useCallback, useContext, useMemo, useRef } from 'react';

import { useScrollBorders } from '../Modal/modal-scroll';
import { cn } from '../utils';

type PopoverScrollContextValue = {
  showFooterBorder: boolean;
};

const PopoverScrollContext = createContext<PopoverScrollContextValue>({
  showFooterBorder: false,
});

function usePopoverScroll() {
  return useContext(PopoverScrollContext);
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { className, children, ...props },
  ref,
) {
  const contentElementRef = useRef<HTMLDivElement | null>(null);
  const { showFooterBorder } = useScrollBorders(contentElementRef);
  const handleContentRef = useCallback((node: HTMLDivElement | null) => {
    contentElementRef.current = node;
  }, []);
  const composedRef = useComposedRefs(ref, handleContentRef);

  const contextValue = useMemo(
    () => ({
      showFooterBorder,
    }),
    [showFooterBorder],
  );

  return (
    <PopoverPortal>
      <PopoverContentPrimitive
        ref={composedRef}
        {...props}
        className={cn(
          className,
          'bg-surface-card border-grey-border z-50 flex max-h-[min(var(--radix-popover-content-available-height),500px)] flex-col overflow-x-hidden overflow-y-auto rounded-sm border text-xs shadow-lg',
        )}
      >
        <PopoverScrollContext.Provider value={contextValue}>{children}</PopoverScrollContext.Provider>
      </PopoverContentPrimitive>
    </PopoverPortal>
  );
});
PopoverContent.displayName = 'PopoverContent';

interface PopoverFooterProps {
  children: ReactNode;
  className?: string;
}

function PopoverFooter({ children, className }: PopoverFooterProps) {
  const { showFooterBorder } = usePopoverScroll();

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

export const Popover = {
  Root: PopoverPrimitive,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Footer: PopoverFooter,
};
