import useIntersection from '@bo/hooks/useIntersection';
import { useRef } from 'react';
import { cn } from 'ui-design-system';

type StickyContainerProps = {
  children: React.ReactNode;
  rootRef?: React.RefObject<HTMLDivElement>;
};

export const StickyContainer = ({ children, rootRef }: StickyContainerProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {});

  return (
    <div data-sticky={!intersection?.isIntersecting} className={cn('sticky top-0')}>
      {children}
    </div>
  );
};
