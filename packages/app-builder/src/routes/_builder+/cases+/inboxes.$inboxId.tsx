import { Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CaseRightPanel } from '@app-builder/components/Cases';
import { CasesList } from '@app-builder/components/Cases/Inbox/CasesList';
import { InboxFilterBar } from '@app-builder/components/Cases/Inbox/FilterBar';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { useBase64Query } from '@app-builder/hooks/useBase64Query';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { filtersSchema, useGetCasesQuery } from '@app-builder/queries/cases/get-cases';
import { DEFAULT_CASE_PAGINATION_SIZE } from '@app-builder/repositories/CaseRepository';
import { getRoute } from '@app-builder/utils/routes';
import { fromSUUIDtoUUID, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Namespace } from 'i18next';
import QueryString from 'qs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { match } from 'ts-pattern';
import { ButtonV2, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['cases', 'filters'] satisfies Namespace,
};

const ALLOWED_FILTERS = [
  'dateRange',
  'statuses',
  'includeSnoozed',
  'excludeAssigned',
  'assignee',
] as const;
const EXCLUDED_FILTERS = ['excludeAssigned', 'assignee'] as const;

const pageQueryStringSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().optional().default(DEFAULT_CASE_PAGINATION_SIZE),
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

export const loader = createServerFn(
  [authMiddleware],
  async function casesInboxesLoader({ request, params, context }) {
    const { inbox: inboxRepository } = context.authInfo;
    const inboxes = await inboxRepository.listInboxesWithCaseCount();
    const inboxId = params['inboxId'];

    invariant(inboxId, 'inboxId is required');

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const parsedSearchParams = pageQueryStringSchema.parse(Object.fromEntries(searchParams));

    return {
      inboxId: inboxId === MY_INBOX_ID ? inboxId : fromSUUIDtoUUID(inboxId),
      inboxes,
      query: parsedSearchParams.q,
      limit: parsedSearchParams.limit,
      order: parsedSearchParams.order,
    };
  },
);

export default function CasesInboxesPage() {
  const { t } = useTranslation(['cases']);
  const navigate = useNavigate();
  const { inboxId, inboxes, query, limit, order } = useLoaderData<typeof loader>();

  const allowedFilters = useMemo(() => {
    if (inboxId === MY_INBOX_ID) {
      return ALLOWED_FILTERS.filter(
        (filter: string) => !(EXCLUDED_FILTERS as readonly string[]).includes(filter),
      );
    }
    return ALLOWED_FILTERS;
  }, [inboxId]);
  const updatePage = (newQuery: string, newLimit: number, newOrder: 'ASC' | 'DESC') => {
    const qs = QueryString.stringify(
      {
        q: newQuery !== '' ? newQuery : undefined,
        limit: newLimit !== DEFAULT_CASE_PAGINATION_SIZE ? newLimit : undefined,
        order: newOrder !== 'DESC' ? newOrder : undefined,
      },
      { addQueryPrefix: true, skipNulls: true },
    );
    navigate({ search: qs }, { replace: true });
  };

  const parsedQuery = useBase64Query(filtersSchema, query, {
    onUpdate(newQuery) {
      updatePage(newQuery, limit, order);
    },
  });
  const casesQuery = useGetCasesQuery(inboxId, parsedQuery.data, limit, order);

  const [searchValue, setSearchValue] = useState('');

  return (
    <Page.Main className="flex flex-col">
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <CaseRightPanel.Root className="overflow-hidden">
        <Page.Container>
          <Page.ContentV2 className="bg-white gap-v2-md">
            <div className="flex flex-col gap-v2-md relative">
              {/* <pre>{JSON.stringify(parsedQuery.data, null, 2)}</pre> */}
              <div className="flex justify-between">
                <InboxFilterBar
                  inboxId={inboxId}
                  inboxes={inboxes}
                  allowedFilters={allowedFilters}
                  filters={parsedQuery.asArray}
                  updateFilters={parsedQuery.update}
                  onInboxSelect={(inboxId) => {
                    const inboxIdSUUID =
                      inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId);
                    navigate(getRoute('/cases/inboxes/:inboxId', { inboxId: inboxIdSUUID }));
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    endAdornment="search"
                    adornmentClassName="size-5"
                    placeholder={t('cases:search.placeholder')}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        parsedQuery.update({ name: searchValue });
                        setSearchValue('');
                      }
                    }}
                  />
                  <CaseRightPanel.Trigger asChild data={{ inboxId }}>
                    <ButtonV2 size="default" variant="primary" appearance="stroked" mode="icon">
                      <Icon icon="plus" className="size-4" />
                    </ButtonV2>
                  </CaseRightPanel.Trigger>
                </div>
              </div>

              {match(casesQuery)
                .with({ isPending: true }, () => {
                  return <div>Loading...</div>;
                })
                .with({ isError: true }, () => {
                  return <div>Error</div>;
                })
                .with({ isSuccess: true }, (successCasesQuery) => {
                  return (
                    <CasesList
                      key={inboxId}
                      casesQuery={successCasesQuery}
                      sorting={order}
                      limit={limit}
                      setLimit={(newLimit) => updatePage(query, newLimit, order)}
                      onSortingChange={(newOrder) => updatePage(query, limit, newOrder)}
                    />
                  );
                })
                .exhaustive()}

              {/* <DateRangeFilter.Root
              dateRangeFilter={data?.dateRange}
              setDateRangeFilter={(dr) => {
                if (dr?.type === 'static') {
                  updateQuery({ dateRange: dr });
                }
              }}
              className="grid"
            >
              <DateRangeFilter.FromNowPicker title={t('cases:filters.date_range.title')} />
              <Separator className="bg-grey-90" decorative orientation="vertical" />
              <DateRangeFilter.Calendar />
              <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
              <DateRangeFilter.Summary className="col-span-3 row-span-1" />
            </DateRangeFilter.Root> */}
            </div>
          </Page.ContentV2>
        </Page.Container>
      </CaseRightPanel.Root>
    </Page.Main>
  );
}
