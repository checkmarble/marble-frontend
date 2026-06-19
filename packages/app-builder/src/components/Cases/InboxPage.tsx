import { Page } from '@app-builder/components';
import { CasesList } from '@app-builder/components/Cases/Inbox/CasesList';
import { FavoriteInboxButton } from '@app-builder/components/Cases/Inbox/FavoriteInboxButton';
import { InboxFilterBar } from '@app-builder/components/Cases/Inbox/FilterBar/FilterBar';
import { MultiSelect } from '@app-builder/components/MultiSelect';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useBase64Query } from '@app-builder/hooks/useBase64Query';
import { Case } from '@app-builder/models/cases';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import { PaginatedResponse } from '@app-builder/models/pagination';
import { filtersSchema, useGetCasesQuery } from '@app-builder/queries/cases/get-cases';
import { useMassUpdateCasesMutation } from '@app-builder/queries/cases/mass-update';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelContent, PanelHeader, PanelRoot } from '../Panel';
import { Spinner } from '../Spinner';
import { CreateCase } from './CreateCase';
import { BatchActions, MassUpdateCasesFn } from './Inbox/BatchActions';
import { InboxEmptyState } from './Inbox/InboxEmptyState';
import { SelectCaseById } from './Inbox/SelectCaseById';
import { CasesNavigationTabs } from './Navigation/Tabs';

const ALLOWED_FILTERS = [
  'dateRange',
  'statuses',
  'qualification',
  'includeSnoozed',
  'excludeAssigned',
  'assignee',
  'tagId',
] as const;
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
  favoriteInboxId?: string;
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
  favoriteInboxId: initialFavoriteInboxId,
}: InboxPageProps) => {
  const { t } = useTranslation(['common', 'cases']);
  const [searchValue, setSearchValue] = useState('');
  const [favoriteInboxId, setFavoriteInboxId] = useState(initialFavoriteInboxId);
  const [isAddingCase, setIsAddingCase] = useState(false);
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
      pathname: `/cases/${fromUUIDtoSUUID(caseId)}`,
      search: inboxId === MY_INBOX_ID ? undefined : `?fromInbox=${fromUUIDtoSUUID(inboxId)}`,
    });
  };

  if (inboxes.length === 0 && inboxId === MY_INBOX_ID) {
    return (
      <Page.Main className="flex flex-col">
        <Page.Content className="gap-md">
          {canViewNavigationTabs ? <CasesNavigationTabs /> : null}
          <InboxEmptyState canManageInboxes={canViewNavigationTabs} />
        </Page.Content>
      </Page.Main>
    );
  }

  return (
    <Page.Main className="flex flex-col">
      <div
        className={cn(
          'h-1 animate-gradient bg-linear-to-r from-transparent from-25% via-purple-primary to-transparent to-75% invisible',
          {
            visible: isSubsequentlyFetching,
          },
        )}
      />
      <Page.Content width="table" className="gap-md">
        {canViewNavigationTabs ? <CasesNavigationTabs /> : null}
        <div className="flex flex-col gap-md relative">
          <MultiSelect.Root id={inboxId}>
            <div className="flex justify-between">
              <div className="flex gap-sm items-center">
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
              <div className="flex gap-sm items-center">
                <FavoriteInboxButton
                  inboxId={inboxId}
                  isFavorite={favoriteInboxId === (inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId))}
                  onToggle={setFavoriteInboxId}
                />
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
                <Button
                  size="medium"
                  variant="primary"
                  appearance="stroked"
                  mode="icon"
                  data-test="create-case-trigger"
                  onClick={() => {
                    setIsAddingCase(true);
                  }}
                >
                  <Icon icon="plus" className="size-4" />
                </Button>
                <PanelRoot open={isAddingCase} onOpenChange={setIsAddingCase}>
                  <PanelContainer size="xl">
                    <PanelContent>
                      <PanelHeader>{t('cases:case.new_case')}</PanelHeader>
                      <CreateCase inboxId={inboxId === MY_INBOX_ID ? null : inboxId} />
                    </PanelContent>
                  </PanelContainer>
                </PanelRoot>
              </div>
            </div>

            {match(casesQuery)
              .with({ isPending: true }, () => {
                return (
                  <div className=" border border-grey-border rounded-md">
                    <div className="h-13 border-b border-grey-border"></div>
                    <div className="h-30 bg-grey-background animate-pulse flex items-center justify-center">
                      <Spinner className="size-12" />
                    </div>
                  </div>
                );
              })
              .with({ isError: true }, () => {
                return (
                  <div className="border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border p-lg flex flex-col gap-sm items-center">
                    <span>{t('cases:errors.fetching_cases')}</span>
                    <Button variant="secondary" onClick={() => casesQuery.refetch()}>
                      {t('common:retry')}
                    </Button>
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
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    fromInboxId={inboxId}
                  />
                );
              })
              .exhaustive()}
          </MultiSelect.Root>
        </div>
      </Page.Content>
    </Page.Main>
  );
};
