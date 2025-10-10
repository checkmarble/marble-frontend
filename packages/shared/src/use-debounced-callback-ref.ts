import React from 'react';

function debounce<T extends (...args: any[]) => void>(callback: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;

  return ((...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}

export function useDebouncedCallbackRef<T extends (...args: any[]) => void>(
  callback: T | undefined,
  delay: number,
): T {
  const callbackRef = React.useRef<T | undefined>();
  callbackRef.current = callback;

  const debouncedFn = React.useRef<T | undefined>();
  React.useEffect(() => {
    debouncedFn.current = debounce(((...args) => callbackRef.current?.(...args)) as T, delay);
  }, [delay]);

  return React.useMemo(() => ((...args) => debouncedFn.current?.(...args)) as T, []);
}
