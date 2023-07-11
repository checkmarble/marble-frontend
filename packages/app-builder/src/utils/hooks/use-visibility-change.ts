import { useEffect, useState } from 'react';

export function useVisibilityChange() {
  const [visibilityState, setVisibilityState] =
    useState<DocumentVisibilityState>('visible');

  useEffect(() => {
    function listener() {
      setVisibilityState(document.visibilityState);
    }
    document.addEventListener('visibilitychange', listener);
    return () => {
      document.removeEventListener('visibilitychange', listener);
    };
  }, []);

  return visibilityState;
}
