import { useCallbackRef } from '@marble/shared';
import { useEffect } from 'react';

type UseIntervalOptions = {
  delay: number | null;
  executeImmediately?: boolean;
};

export const useInterval = (callback: () => void, { delay, executeImmediately = false }: UseIntervalOptions) => {
  const _callback = useCallbackRef(callback);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    if (executeImmediately) {
      _callback();
    }

    const intervalId = setInterval(() => _callback(), delay);
    return () => clearInterval(intervalId);
  }, [_callback, delay, executeImmediately]);
};
