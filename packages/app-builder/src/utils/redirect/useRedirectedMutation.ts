import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useCallbackRef } from '@marble/shared';
import {
  DefaultError,
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from '@tanstack/react-query';

export function useRedirectedMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const navigate = useAgnosticNavigation();
  const handleMutationRedirect = useCallbackRef(async (variables: TVariables) => {
    const result = await options.mutationFn?.(variables);
    if (
      result instanceof Object &&
      result != null &&
      'redirectTo' in result &&
      typeof result.redirectTo === 'string'
    ) {
      navigate(result.redirectTo);
      return;
    }
    return result;
  }) as typeof options.mutationFn;

  return useMutation({ ...options, mutationFn: handleMutationRedirect }, queryClient);
}
