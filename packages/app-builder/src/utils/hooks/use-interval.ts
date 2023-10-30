import { useEffect, useRef } from 'react';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 *
 * @param callback A callback triggered on each interval
 * @param delay If delay is null, the interval is paused. If delay is 0, the interval is executed on each render.
 * @param executeImmediately If true, the callback is executed immediately on mount
 */
export function useInterval(
  callback: () => void,
  {
    delay,
    executeImmediately = false,
  }: { delay: number | null; executeImmediately?: boolean }
) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    if (executeImmediately) savedCallback.current();
    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay, executeImmediately]);
}
