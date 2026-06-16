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
import { ViewSavedResults } from '@app-builder/components/Screenings/FreeformSearch/ViewSavedResults';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useSaveFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { normalizeListConfig } from '@app-builder/queries/screening/lists-config';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import * as Sentry from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type Namespace } from 'i18next';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

const screeningSearchLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function screeningSearchLoader({ context }) {
    const rawListConfig = await context.authInfo.screening.getAvailableFilters({ feature: 'manual_search' });
    return { listConfig: normalizeListConfig(rawListConfig) };
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
  const { listConfig } = Route.useLoaderData();
  const [searchState, setSearchState] = useState<FreeformSearchState | null>(null);
  const saveSearchMutation = useSaveFreeformSearchMutation();
  const userName = [currentUser.actorIdentity.firstName, currentUser.actorIdentity.lastName].filter(Boolean).join(' ');

  const handleSearchComplete = useCallback((state: FreeformSearchState) => {
    setSearchState(state);
  }, []);

  function handleSaveSearch() {
    if (!searchState?.inputs) return;
    saveSearchMutation
      .mutateAsync({ id: searchState.searchId })
      .then(() => toast.success(t('screenings:freeform_search.save.success')))
      .catch(() => toast.error(t('common:errors.unknown')));
  }

  const hasResults = searchState !== null && searchState.results.length > 0;

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="h-full gap-v2-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{t('navigation:screening_search')}</h1>
            <div className="flex items-center gap-v2-sm">
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
              {searchState?.searchId && (
                <Button variant="secondary" onClick={handleSaveSearch} disabled={saveSearchMutation.isPending}>
                  <Icon icon="save" className="size-4" />
                  {t('screenings:freeform_search.save.button')}
                </Button>
              )}
              <ViewSavedResults />
            </div>
          </div>
          <FreeformSearchPage onSearchComplete={handleSearchComplete} listConfig={listConfig.filters} />
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}
