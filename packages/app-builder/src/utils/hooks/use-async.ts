import * as React from 'react';

import { useCallbackRef } from './use-callback-ref';

/**
 * A custom hook that wraps an async function and provides loading, error and value states
 *
 * Inspired from https://github.com/sergeyleschev/react-custom-hooks?tab=readme-ov-file#2-useasync
 */
export default function useAsync<Args extends Array<unknown>, Return>(
  callback: (...args: Args) => Promise<Return>,
) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>();
  const [value, setValue] = React.useState<Return>();

  const callbackRef = useCallbackRef(callback);

  const callbackMemoized = React.useCallback(
    async (...args: Args): Promise<void> => {
      try {
        setLoading(true);
        setError(undefined);
        setValue(await callbackRef(...args));
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [callbackRef],
  );

  return [callbackMemoized, { loading, error, value }] as const;
}
