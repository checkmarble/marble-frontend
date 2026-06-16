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

const defaultScrollBorders: ScrollBorders = {
  showTitleBorder: false,
  showFooterBorder: false,
};

export function useScrollBorders(scrollElement: HTMLElement | null) {
  const [scrollBorders, setScrollBorders] = useState<ScrollBorders>(defaultScrollBorders);

  useEffect(() => {
    if (!scrollElement) {
      setScrollBorders(defaultScrollBorders);
      return;
    }

    const updateScrollBorders = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      setScrollBorders(getModalScrollBorders(scrollTop, scrollHeight, clientHeight));
    };

    updateScrollBorders();
    const raf = requestAnimationFrame(updateScrollBorders);
    scrollElement.addEventListener('scroll', updateScrollBorders, { passive: true });

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(updateScrollBorders) : null;
    resizeObserver?.observe(scrollElement);

    const mutationObserver = typeof MutationObserver === 'function' ? new MutationObserver(updateScrollBorders) : null;
    mutationObserver?.observe(scrollElement, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(raf);
      scrollElement.removeEventListener('scroll', updateScrollBorders);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [scrollElement]);

  return scrollBorders;
}
