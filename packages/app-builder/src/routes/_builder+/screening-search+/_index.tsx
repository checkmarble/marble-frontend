import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { FreeformSearchPage } from '@app-builder/components/Screenings/FreeformSearch/FreeformSearchPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['common', 'screenings', 'navigation'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async () => {
  return null;
});

export default function ScreeningSearchIndexPage() {
  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container className="h-full p-4">
        <FreeformSearchPage />
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
