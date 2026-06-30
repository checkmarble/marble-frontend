import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '../utils';

type StickyComponentProps = {
  children: ReactNode;
  sentinelClassName?: string;
  /**
   * Use an in-flow sentinel for sticky elements inside a scroll container.
   * Absolute sentinels only work when the containing block spans the full scrollable content.
   * As the sentinel is not absolute let the element be place in the content via value.
   */
  inFlow?: 'before' | 'after';
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

export function StickyComponent({ children, sentinelClassName, inFlow }: StickyComponentProps) {
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
      {inFlow !== 'after' ? (
        <div
          ref={sentinelRef}
          data-sentinel
          className={cn(inFlow ? 'relative h-px w-full shrink-0' : 'absolute', sentinelClassName)}
        />
      ) : null}
      {children}
      {inFlow === 'after' ? (
        <div ref={sentinelRef} data-sentinel className={cn('relative h-px w-full shrink-0', sentinelClassName)} />
      ) : null}
    </>
  );
}
