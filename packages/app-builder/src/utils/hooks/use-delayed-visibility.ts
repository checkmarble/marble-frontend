import { useEffect, useState } from 'react';

export function useDelayedVisibility(active: boolean, delayMs: number) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setReady(true);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [active, delayMs]);

  return active && ready;
}
