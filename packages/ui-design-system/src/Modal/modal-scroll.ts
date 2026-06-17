import { useEffect, useState } from 'react';

export type ScrollBorders = {
  showTitleBorder: boolean;
  showFooterBorder: boolean;
};

export function getModalScrollBorders(scrollTop: number, scrollHeight: number, clientHeight: number) {
  const hasOverflow = scrollHeight - clientHeight > 1;
  return {
    showTitleBorder: hasOverflow && scrollTop > 0,
    showFooterBorder: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
  };
}

function canScrollVertically(element: HTMLElement) {
  const { overflowY } = getComputedStyle(element);
  return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
}

function hasScrollableOverflow(element: HTMLElement) {
  return element.scrollHeight - element.clientHeight > 1;
}

export function getModalScrollElement(rootElement: HTMLElement) {
  if (canScrollVertically(rootElement) && hasScrollableOverflow(rootElement)) {
    return rootElement;
  }

  return (
    Array.from(rootElement.querySelectorAll<HTMLElement>('*')).find(
      (element) => canScrollVertically(element) && hasScrollableOverflow(element),
    ) ?? rootElement
  );
}

const defaultScrollBorders: ScrollBorders = {
  showTitleBorder: false,
  showFooterBorder: false,
};

export function useScrollBorders(rootElement: HTMLElement | null) {
  const [scrollBorders, setScrollBorders] = useState<ScrollBorders>(defaultScrollBorders);

  useEffect(() => {
    if (!rootElement) {
      setScrollBorders(defaultScrollBorders);
      return;
    }

    const updateScrollBorders = (scrollElement = getModalScrollElement(rootElement)) => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const nextBorders = getModalScrollBorders(scrollTop, scrollHeight, clientHeight);
      setScrollBorders(nextBorders);
    };

    const handleScroll = (event: Event) => {
      if (event.target instanceof HTMLElement && rootElement.contains(event.target)) {
        updateScrollBorders(event.target);
        return;
      }

      updateScrollBorders();
    };

    updateScrollBorders();
    const raf = requestAnimationFrame(() => updateScrollBorders());
    rootElement.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    const resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => updateScrollBorders()) : null;
    resizeObserver?.observe(rootElement);

    const mutationObserver =
      typeof MutationObserver === 'function' ? new MutationObserver(() => updateScrollBorders()) : null;
    mutationObserver?.observe(rootElement, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(raf);
      rootElement.removeEventListener('scroll', handleScroll, { capture: true });
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [rootElement]);

  return scrollBorders;
}
