import { Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CaseRightPanel } from '@app-builder/components/Cases';
import { CasesList } from '@app-builder/components/Cases/Inbox/CasesList';
import { InboxFilterBar } from '@app-builder/components/Cases/Inbox/FilterBar/FilterBar';
import { MultiSelect } from '@app-builder/components/MultiSelect';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useBase64Query } from '@app-builder/hooks/useBase64Query';
import useIntersection from '@app-builder/hooks/useIntersection';
import { Case } from '@app-builder/models/cases';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import { PaginatedResponse } from '@app-builder/models/pagination';
import { filtersSchema, useGetCasesQuery } from '@app-builder/queries/cases/get-cases';
import { useMassUpdateCasesMutation } from '@app-builder/queries/cases/mass-update';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, cn, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Spinner } from '../Spinner';
import { BatchActions, MassUpdateCasesFn } from './Inbox/BatchActions';
import { SelectCaseById } from './Inbox/SelectCaseById';
import { CasesNavigationTabs } from './Navigation/Tabs';

const ALLOWED_FILTERS = ['dateRange', 'statuses', 'includeSnoozed', 'excludeAssigned', 'assignee', 'tagId'] as const;
const EXCLUDED_FILTERS = ['excludeAssigned', 'assignee'] as const;

type InboxPageProps = {
  inboxId: string;
  inboxes: InboxWithCasesCount[];
  inboxUsersIds: string[];
  canViewNavigationTabs: boolean;
  query: string;
  limit: number;
  order: 'ASC' | 'DESC';
  updatePage: (newQuery: string, newLimit: number, newOrder: 'ASC' | 'DESC') => void;
  onInboxSelect: (inboxId: string) => void;
};

export const InboxPage = ({
  inboxId,
  inboxes,
  inboxUsersIds,
  canViewNavigationTabs,
  query,
  limit,
  order,
  updatePage,
  onInboxSelect,
}: InboxPageProps) => {
  const { t } = useTranslation(['common', 'cases']);
  const [searchValue, setSearchValue] = useState('');
  const { orgUsers } = useOrganizationUsers();
  const navigate = useAgnosticNavigation();

  const assignableUsers = useMemo(() => {
    return orgUsers.filter(({ userId, role }) => inboxUsersIds.includes(userId) || role === 'ADMIN');
  }, [orgUsers, inboxUsersIds]);

  const allowedFilters = useMemo(() => {
    if (inboxId === MY_INBOX_ID) {
      return ALLOWED_FILTERS.filter((filter: string) => !(EXCLUDED_FILTERS as readonly string[]).includes(filter));
    }
    return ALLOWED_FILTERS;
  }, [inboxId]);

  const parsedQuery = useBase64Query(filtersSchema, query, {
    onUpdate(newQuery) {
      updatePage(newQuery, limit, order);
    },
  });
  const casesQuery = useGetCasesQuery(inboxId, parsedQuery.data, limit, order);
  const massUpdateCasesMutation = useMassUpdateCasesMutation();
  const queryClient = useQueryClient();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: wrapperRef.current,
    rootMargin: '1px',
    threshold: 1,
  });
  const isSubsequentlyFetching = casesQuery.isFetchingNextPage || (casesQuery.isFetching && !casesQuery.isPending);
  const [currentPage, setCurrentPage] = useState(0);

  // region: To avoid flickering the results only reset the current page when data arrives (only on filters or inbox change)
  const lastFirstPageResultRef = useRef<PaginatedResponse<Case> | undefined>();
  const hasChangedFiltersOrInboxRef = useRef(false);

  useEffect(() => {
    hasChangedFiltersOrInboxRef.current = true;
  }, [inboxId, query]);

  useEffect(() => {
    if (lastFirstPageResultRef.current !== casesQuery.data?.pages[0]) {
      lastFirstPageResultRef.current = casesQuery.data?.pages[0];
      if (hasChangedFiltersOrInboxRef.current) {
        hasChangedFiltersOrInboxRef.current = false;
        setCurrentPage(0);
      }
    }
  }, [casesQuery.data?.pages[0]]);
  // endregion

  const onMassUpdateCases: MassUpdateCasesFn = (items, params) => {
    const caseIds = items.map((item) => item.id);
    massUpdateCasesMutation.mutateAsync({ caseIds, ...params }).then((res) => {
      queryClient.invalidateQueries();
    });
  };

  const handleNavigate = (caseId: string) => {
    navigate({
      pathname: getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseId) }),
      search: inboxId === MY_INBOX_ID ? undefined : `?fromInbox=${fromUUIDtoSUUID(inboxId)}`,
    });
  };

  return (
    <Page.Main className="flex flex-col">
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <div
        className={cn(
          'h-1 animate-gradient bg-linear-to-r from-transparent from-25% via-purple-65 to-transparent to-75% invisible',
          {
            visible: isSubsequentlyFetching,
          },
        )}
      />
      <CaseRightPanel.Root className="overflow-hidden">
        <Page.Container ref={wrapperRef}>
          <Page.ContentV2 className="bg-white gap-v2-md">
            {canViewNavigationTabs ? <CasesNavigationTabs /> : null}
            <div className="flex flex-col gap-v2-md relative">
              <MultiSelect.Root id={inboxId}>
                <div className="flex justify-between">
                  <div className="flex gap-v2-sm items-center">
                    <MultiSelect.Subscribe<Case>>
                      {(count, items) => {
                        if (count === 0 || !casesQuery.isSuccess) return null;

                        return (
                          <BatchActions
                            selectedCases={items}
                            inboxes={inboxes}
                            assignableUsers={assignableUsers}
                            onMassUpdateCases={onMassUpdateCases}
                          />
                        );
                      }}
                    </MultiSelect.Subscribe>
                    <InboxFilterBar
                      inboxId={inboxId}
                      inboxes={inboxes}
                      allowedFilters={allowedFilters}
                      filters={parsedQuery.asArray}
                      updateFilters={parsedQuery.update}
                      onInboxSelect={onInboxSelect}
                    />
                  </div>
                  <div className="flex gap-v2-sm">
                    <SelectCaseById onNavigate={handleNavigate} />
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
                    return (
                      <div className=" border border-grey-border rounded-v2-md">
                        <div className="h-13 border-b border-grey-border"></div>
                        <div className="h-30 bg-grey-background animate-pulse flex items-center justify-center">
                          <Spinner className="size-12" />
                        </div>
                      </div>
                    );
                  })
                  .with({ isError: true }, () => {
                    return (
                      <div className="border-red-74 bg-red-95 text-red-47 mt-3 rounded-sm border p-v2-lg flex flex-col gap-v2-sm items-center">
                        <span>{t('cases:errors.fetching_cases')}</span>
                        <ButtonV2 variant="secondary" onClick={() => casesQuery.refetch()}>
                          {t('common:retry')}
                        </ButtonV2>
                      </div>
                    );
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
                        isPaginationSticky={!(intersection?.isIntersecting ?? true)}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                      />
                    );
                  })
                  .exhaustive()}

                <div ref={sentinelRef} className="absolute left-0 bottom-0" />
              </MultiSelect.Root>
            </div>
          </Page.ContentV2>
        </Page.Container>
      </CaseRightPanel.Root>
    </Page.Main>
  );
};
