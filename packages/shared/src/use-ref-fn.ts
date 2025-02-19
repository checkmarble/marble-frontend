import { type MutableRefObject, useRef } from 'react';

const UNINIT_VALUE = Symbol('uninitialized_value');

/**
 * Create a ref with an initializer function which is not re-executed after initialization
 *
 * @param initializer The initializer function, should return you value
 * @returns A React RefObject with your value
 */
export function useRefFn<T>(initializer: () => T): MutableRefObject<T> {
  const cachedRef = useRef<T | typeof UNINIT_VALUE>(UNINIT_VALUE);

  let refValue = cachedRef.current;
  if (refValue === UNINIT_VALUE) {
    refValue = initializer();
    cachedRef.current = refValue;
  }

  return useRef(refValue);
}
