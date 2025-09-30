import { useCallback, useEffect, useRef, useState } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}

export interface UseResizeObserverOptions {
  /**
   * Throttle interval in milliseconds. Default is 16ms (~60fps)
   */
  throttleMs?: number;
  /**
   * Whether to observe both width and height changes. Default is true.
   */
  observeHeight?: boolean;
  /**
   * Initial dimensions to use before first measurement. Default is { width: 0, height: 0 }
   */
  initialDimensions?: Dimensions;
}

/**
 * Custom hook that provides reactive element dimensions using ResizeObserver
 * Optimized for performance with throttling to prevent excessive re-renders
 */
export const useResizeObserver = <T extends HTMLElement = HTMLDivElement>(
  options: UseResizeObserverOptions = {},
): {
  ref: React.RefObject<T>;
  dimensions: Dimensions;
} => {
  const {
    throttleMs = 16, // ~60fps
    observeHeight = true,
    initialDimensions = { width: 0, height: 0 },
  } = options;

  const elementRef = useRef<T>(null);
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
  const animationFrameIdRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);

  // Throttled dimensions update to avoid excessive re-renders
  const updateDimensions = useCallback((newDimensions: Dimensions) => {
    setDimensions(newDimensions);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const now = performance.now();

        // Cancel previous animation frame
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }

        // Only update if enough time has passed since last update (throttling)
        if (now - lastUpdateTimeRef.current >= throttleMs) {
          lastUpdateTimeRef.current = now;
          updateDimensions({ width, height });
        } else {
          // Schedule update for next animation frame if throttling
          animationFrameIdRef.current = requestAnimationFrame(() => {
            lastUpdateTimeRef.current = performance.now();
            updateDimensions({ width, height });
          });
        }
      }
    });

    // Start observing the element
    resizeObserver.observe(element);

    // Set initial dimensions using getBoundingClientRect for immediate availability
    const rect = element.getBoundingClientRect();
    updateDimensions({
      width: rect.width,
      height: observeHeight ? rect.height : 0,
    });

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [throttleMs, observeHeight, updateDimensions]);

  return {
    ref: elementRef,
    dimensions,
  };
};
