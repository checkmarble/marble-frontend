import { ReactNode, useEffect, useRef } from 'react';
import { cn } from 'ui-design-system';

type StickyComponentProps = {
  children: ReactNode;
  sentinelClassName?: string;
};

export function StickyComponent({ children, sentinelClassName }: StickyComponentProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sentinelRef.current) {
      const observer = new IntersectionObserver(
        ([e]) => {
          if (e) {
            e.target.toggleAttribute('data-intersect', e.intersectionRatio < 1);
          }
        },
        { threshold: [1] },
      );
      observer.observe(sentinelRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <>
      <div ref={sentinelRef} data-sentinel className={cn('absolute', sentinelClassName)} />
      {children}
    </>
  );
}
