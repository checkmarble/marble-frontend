import { Page } from '@app-builder/components';
import { casesI18n, CasesList } from '@app-builder/components/Cases';
import {
  type CasesFilters,
  CasesFiltersBar,
  CasesFiltersMenu,
  CasesFiltersProvider,
  casesFiltersSchema,
} from '@app-builder/components/Cases/Filters';
import { casesFilterNames } from '@app-builder/components/Cases/Filters/filters';
import { FiltersButton } from '@app-builder/components/Filters';
import { serverServices } from '@app-builder/services/init.server';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import qs from 'qs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CaseManager } from 'ui-icons';

export const handle = {
  i18n: ['navigation', ...casesI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedQuery = await parseQuerySafe(request, casesFiltersSchema);
  if (!parsedQuery.success) {
    return redirect(getRoute('/cases'));
  }
  const filters = parsedQuery.data;
  const caseList = await cases.listCases(filters);

  return json({ cases: caseList, filters });
}

export default function Cases() {
  const { t } = useTranslation(handle.i18n);
  const { cases, filters } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const submitCasesFilters = useCallback(
    (casesFilters: CasesFilters) => {
      navigate(
        {
          pathname: getRoute('/cases'),
          search: qs.stringify(
            {
              statuses: casesFilters.statuses ?? [],
              dateRange: casesFilters.dateRange
                ? casesFilters.dateRange.type === 'static'
                  ? {
                      type: 'static',
                      endDate: casesFilters.dateRange.endDate || null,
                      startDate: casesFilters.dateRange.startDate || null,
                    }
                  : {
                      type: 'dynamic',
                      fromNow: casesFilters.dateRange.fromNow,
                    }
                : {},
            },
            {
              addQueryPrefix: true,
              skipNulls: true,
            }
          ),
        },
        { replace: true }
      );
    },
    [navigate]
  );

  return (
    <Page.Container>
      <Page.Header>
        <CaseManager className="mr-2" height="24px" width="24px" />
        {t('navigation:caseManager')}
      </Page.Header>
      <Page.Content>
        <div className="flex flex-col gap-4">
          <CasesFiltersProvider
            submitCasesFilters={submitCasesFilters}
            filterValues={filters}
          >
            <div className="flex justify-end gap-4">
              <CasesFiltersMenu filterNames={casesFilterNames}>
                <FiltersButton />
              </CasesFiltersMenu>
            </div>
            <CasesFiltersBar />
            <CasesList cases={cases} />
          </CasesFiltersProvider>
        </div>
      </Page.Content>
    </Page.Container>
  );
}
