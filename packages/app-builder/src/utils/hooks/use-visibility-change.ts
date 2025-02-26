import { useSyncExternalStore } from 'react';

function subscribe(listener: (this: Document, ev: DocumentEventMap['visibilitychange']) => void) {
  document.addEventListener('visibilitychange', listener);
  return () => {
    document.removeEventListener('visibilitychange', listener);
  };
}

export function useVisibilityChange() {
  return useSyncExternalStore<DocumentVisibilityState>(
    subscribe,
    () => document.visibilityState,
    () => 'visible',
  );
}
