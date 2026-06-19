import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '../utils';

type StickyComponentProps = {
  children: ReactNode;
  sentinelClassName?: string;
  /**
   * Use an in-flow sentinel for sticky elements inside a scroll container.
   * Absolute sentinels only work when the containing block spans the full scrollable content.
   */
  inFlow?: boolean;
};

function getScrollParent(element: HTMLElement) {
  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = getComputedStyle(parent);

    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

export function StickyComponent({ children, sentinelClassName, inFlow = false }: StickyComponentProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const root = inFlow ? getScrollParent(sentinel) : null;

    const observer = new IntersectionObserver(
      ([e]) => {
        if (e) {
          e.target.toggleAttribute('data-intersect', e.intersectionRatio < 1);
        }
      },
      { threshold: [1], root },
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [inFlow]);

  return (
    <>
      <div
        ref={sentinelRef}
        data-sentinel
        className={cn(inFlow ? 'h-px w-full shrink-0' : 'absolute', sentinelClassName)}
      />
      {children}
    </>
  );
}
