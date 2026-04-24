import { DevLanguageShortcut } from '@app-builder/components/DevLanguageShortcut';
import { AgnosticNavigationContext } from '@app-builder/contexts/AgnosticNavigationContext';
import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useSegmentPageTracking } from '@app-builder/services/segment';
import { createFileRoute, Outlet, useNavigate, useRouter } from '@tanstack/react-router';
import QueryString from 'qs';
import { useCallback } from 'react';
import { Tooltip } from 'ui-design-system';

export const Route = createFileRoute('/_app')({
  component: App,
});

function App() {
  useSegmentPageTracking();

  return (
    <RootProviders>
      <DevLanguageShortcut />
      <Outlet />
    </RootProviders>
  );
}

function RootProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tsNavigate = useNavigate();

  // Adapt TanStack Router's navigate to the AgnosticNavigationContext interface.
  // The context expects (to: string | LocationDescriptor, options?) | (delta: number).
  const navigate = useCallback(
    (
      toOrDelta: string | number | { pathname?: string; search?: string; hash?: string },
      options?: { replace?: boolean },
    ) => {
      if (typeof toOrDelta === 'number') {
        window.history.go(toOrDelta);
        return;
      }
      const to = typeof toOrDelta === 'string' ? toOrDelta : (toOrDelta.pathname ?? '/');
      const search =
        typeof toOrDelta !== 'string' && toOrDelta.search
          ? QueryString.parse(toOrDelta.search, { ignoreQueryPrefix: true })
          : undefined;

      tsNavigate({ to, replace: options?.replace, search });
    },
    [tsNavigate],
  );

  // router.invalidate() is the TanStack Router equivalent of Remix's revalidator.revalidate()
  const invalidate = useCallback(() => {
    router.invalidate();
  }, [router]);

  return (
    <LoaderRevalidatorContext.Provider value={invalidate}>
      <AgnosticNavigationContext.Provider value={navigate}>
        <Tooltip.Provider>{children}</Tooltip.Provider>
      </AgnosticNavigationContext.Provider>
    </LoaderRevalidatorContext.Provider>
  );
}
