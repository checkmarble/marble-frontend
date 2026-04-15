import { ErrorComponent, Page } from '@app-builder/components';
import { PrintHeader, PrintView } from '@app-builder/components/Print';
import {
  FreeformSearchPage,
  type FreeformSearchState,
} from '@app-builder/components/Screenings/FreeformSearch/FreeformSearchPage';
import {
  PrintResults,
  PrintSearchSummary,
} from '@app-builder/components/Screenings/FreeformSearch/FreeformSearchPrint';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import * as Sentry from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type Namespace } from 'i18next';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

const screeningSearchLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function screeningSearchLoader() {
    return null;
  });

export const Route = createFileRoute('/_app/_builder/screening-search/')({
  staticData: {
    i18n: ['common', 'screenings', 'navigation'] satisfies Namespace,
  },
  loader: () => screeningSearchLoader(),
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: ScreeningSearchIndexPage,
});

function ScreeningSearchIndexPage() {
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
      <Page.Container>
        <Page.ContentV2 className="h-full gap-v2-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{t('navigation:screening_search')}</h1>
            {hasResults && (
              <PrintView
                title={t('screenings:print.title')}
                trigger={
                  <Button variant="secondary">
                    <Icon icon="download" className="size-4" />
                    {t('screenings:print.open_print_view')}
                  </Button>
                }
              >
                <PrintHeader title={t('screenings:print.title')} userName={userName} />
                <PrintSearchSummary searchInputs={searchState.inputs} />
                <PrintResults results={searchState.results} />
              </PrintView>
            )}
          </div>
          <FreeformSearchPage onSearchComplete={handleSearchComplete} />
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}
