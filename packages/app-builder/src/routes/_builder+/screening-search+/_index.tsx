import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { PrintHeader, PrintView } from '@app-builder/components/Print';
import {
  FreeformSearchPage,
  type FreeformSearchState,
} from '@app-builder/components/Screenings/FreeformSearch/FreeformSearchPage';
import {
  PrintResults,
  PrintSearchSummary,
} from '@app-builder/components/Screenings/FreeformSearch/FreeformSearchPrint';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'screenings', 'navigation'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async () => {
  return null;
});

export default function ScreeningSearchIndexPage() {
  const { t } = useTranslation(['screenings']);
  const { currentUser } = useOrganizationDetails();
  const [searchState, setSearchState] = useState<FreeformSearchState | null>(null);

  const userName = [currentUser.actorIdentity.firstName, currentUser.actorIdentity.lastName].filter(Boolean).join(' ');

  const handleSearchComplete = useCallback((state: FreeformSearchState) => {
    setSearchState(state);
  }, []);

  const hasResults = searchState !== null && searchState.results.length > 0;

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {hasResults && (
          <PrintView
            title={t('screenings:print.title')}
            trigger={
              <ButtonV2 variant="secondary">
                <Icon icon="download" className="size-4" />
                {t('screenings:print.open_print_view')}
              </ButtonV2>
            }
          >
            <PrintHeader title={t('screenings:print.title')} userName={userName} />
            <PrintSearchSummary searchInputs={searchState.inputs} />
            <PrintResults results={searchState.results} />
          </PrintView>
        )}
      </Page.Header>
      <Page.Container>
        <Page.Description>{t('screenings:freeform_search.description')}</Page.Description>
        <Page.ContentV2 className="h-full">
          <FreeformSearchPage onSearchComplete={handleSearchComplete} />
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
