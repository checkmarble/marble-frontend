import {
  QueryErrorResetBoundary,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type AnySuspenseQueryOptions = UseSuspenseQueryOptions<any, any, any, any>;

type ChildProp<T extends AnySuspenseQueryOptions> = T extends UseSuspenseQueryOptions<
  infer TData,
  infer TError,
  any,
  any
>
  ? (data: UseSuspenseQueryResult<TData, TError>['data']) => React.ReactNode
  : never;

// type ErrorComponentProp<T extends AnySuspenseQueryOptions> = T extends UseSuspenseQueryOptions<
//   infer TData,
//   infer TError,
//   any,
//   any
// >
//   ? (props: { error: UseSuspenseQueryResult<TData, TError>['error'] }) => React.ReactNode
//   : never;

type SuspenseQueryProps<T extends AnySuspenseQueryOptions> = SuspenseQueryComponentProps<T> & {
  errorComponent: ({ error, reset }: { error: any; reset: () => void }) => React.ReactNode;
  fallback?: React.ReactNode;
};

type SuspenseQueryComponentProps<T extends AnySuspenseQueryOptions> = {
  query: T;
  children: ChildProp<T>;
};

export function SuspenseQuery<T extends AnySuspenseQueryOptions>({
  query,
  children,
  errorComponent: ErrorComponent,
  fallback,
}: SuspenseQueryProps<T>) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorComponent error={error} reset={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={fallback}>
            <SuspensedQueryComponent query={query} children={children} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function SuspensedQueryComponent<T extends AnySuspenseQueryOptions>({
  query,
  children,
}: SuspenseQueryComponentProps<T>) {
  const { data } = useSuspenseQuery(query);
  return children(data);
}
