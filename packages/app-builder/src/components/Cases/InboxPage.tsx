import { CursorPaginationButtons, Page } from '@app-builder/components';
import { CasesList } from '@app-builder/components/Cases';
import { CaseRightPanel } from '@app-builder/components/Cases/CaseRightPanel';
import {
  CasesFilters,
  CasesFiltersBar,
  CasesFiltersMenu,
  CasesFiltersProvider,
} from '@app-builder/components/Cases/Filters';
import { FiltersButton } from '@app-builder/components/Filters';
import { InputWithButton } from '@app-builder/components/InputWithButton';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import useIntersection from '@app-builder/hooks/useIntersection';
import { useListSelection } from '@app-builder/hooks/useListSelection';
import { type Case } from '@app-builder/models/cases';
import { Inbox } from '@app-builder/models/inbox';
import { PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import { useMassUpdateCasesMutation } from '@app-builder/queries/cases/mass-update';
import { DEFAULT_CASE_PAGINATION_SIZE } from '@app-builder/repositories/CaseRepository';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { omit } from 'remeda';
import shortUUID from 'short-uuid';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { BatchActions, MassUpdateCasesFn } from './Inbox/BatchActions';

export type InboxPageProps = {
  inboxId: shortUUID.UUID | null;
  inboxes: Inbox[];
  inboxUsersIds: string[];
  data: PaginatedResponse<Case>;
  filters: CasesFilters;
  paginationParams: PaginationParams;
  hasPreviousPage: boolean;
  pageNb: number;
  navigateCasesList: (filters: CasesFilters, pagination?: PaginationParams) => void;
};

export const InboxPage = ({
  inboxId,
  inboxes,
  inboxUsersIds,
  data,
  filters,
  paginationParams,
  hasPreviousPage,
  pageNb,
  navigateCasesList,
}: InboxPageProps) => {
  const { t } = useTranslation(['common', 'cases']);
  const navigate = useAgnosticNavigation();
  const revalidate = useLoaderRevalidator();

  const { items: cases, ...pagination } = data;
  const { orgUsers } = useOrganizationUsers();

  const excludedFilters = !inboxId ? ['excludeAssigned'] : undefined;
  const {
    hasSelectedRows,
    rowSelection,
    getSelectedRows,
    selectionProps,
    tableProps,
    setRowSelection,
  } = useListSelection<Case>(cases, (row) => row.id);
  const massUpdateCasesMutation = useMassUpdateCasesMutation();

  const paginationSentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paginationIntersection = useIntersection(paginationSentinelRef, {
    root: containerRef.current,
    rootMargin: '-24px',
    threshold: 0,
  });

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [cases]);

  const onMassUpdateCases: MassUpdateCasesFn = (params) => {
    const selectedCaseIds = getSelectedRows().map((row) => row.id);
    massUpdateCasesMutation.mutateAsync({ caseIds: selectedCaseIds, ...params }).then((res) => {
      setRowSelection((rows) => R.omit(rows, selectedCaseIds));
      revalidate();
    });
  };

  const assignableUsers = useMemo(() => {
    return orgUsers.filter(
      ({ userId, role }) => inboxUsersIds.includes(userId) || role === 'ADMIN',
    );
  }, [orgUsers, inboxUsersIds]);

  const moveableInboxes = useMemo(() => {
    return inboxes.filter(({ id }) => id !== inboxId);
  }, [inboxes, inboxId]);

  const selectedRows = useMemo(() => {
    return getSelectedRows();
  }, [getSelectedRows, rowSelection]);

  let hasAlreadyOrdered = false;

  return (
    <CaseRightPanel.Root>
      <Page.Container ref={containerRef}>
        <Page.ContentV2>
          <div className="flex flex-col gap-4 relative">
            <CasesFiltersProvider submitCasesFilters={navigateCasesList} filterValues={filters}>
              <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                  <InputWithButton
                    initialValue={filters.name}
                    buttonLabel={t('common:search')}
                    placeholder={t('cases:search.placeholder')}
                    label={t('cases:search.placeholder')}
                    onClear={() => {
                      navigateCasesList({ ...filters, name: undefined });
                    }}
                    onChange={(value) => {
                      navigateCasesList({ ...filters, name: value });
                    }}
                    validator={z.string().min(1)}
                    icon="search"
                  />
                  {t('common:or')}
                  <InputWithButton
                    buttonLabel={t('cases:access_by_id.button_label')}
                    placeholder={t('cases:access_by_id.placeholder')}
                    label={t('cases:access_by_id.placeholder')}
                    onChange={(value) => {
                      navigate(getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(value) }));
                    }}
                    validator={z.uuid()}
                    icon="arrow-up-right"
                    inputClassName="w-80"
                  />
                </div>
                <div className="flex gap-2">
                  <CasesFiltersMenu excludedFilters={excludedFilters}>
                    <FiltersButton />
                  </CasesFiltersMenu>
                  <CaseRightPanel.Trigger asChild data={{ inboxId }}>
                    <Button>
                      <Icon icon="plus" className="size-5" />
                      {t('cases:case.new_case')}
                    </Button>
                  </CaseRightPanel.Trigger>
                  {hasSelectedRows ? (
                    <BatchActions
                      selectedCases={selectedRows}
                      onMassUpdateCases={onMassUpdateCases}
                      assignableUsers={assignableUsers}
                      inboxes={moveableInboxes}
                    />
                  ) : null}
                </div>
              </div>
              <CasesFiltersBar
                excludedFilters={!inboxId ? ['excludeAssigned', 'assignee'] : undefined}
              />
              <CasesList
                key={inboxId}
                cases={cases}
                initSorting={[
                  {
                    id: paginationParams.sorting ?? 'created_at',
                    desc: paginationParams.order === 'DESC',
                  },
                ]}
                onSortingChange={(state) => {
                  const params: PaginationParams = {
                    ...omit(paginationParams, ['order']),
                    order: state[0]?.desc ? 'DESC' : 'ASC',
                  };

                  if (hasAlreadyOrdered) navigateCasesList(filters, params);
                  hasAlreadyOrdered = true;
                }}
                selectable
                selectionProps={selectionProps}
                tableProps={tableProps}
              />
              <div
                className={cn(
                  'flex justify-between gap-8 sticky bottom-0 z-10 bg-purple-99 -mb-v2-lg -mx-v2-lg p-v2-lg pt-v2-md border-t border-purple-99',
                  {
                    'shadow-sticky-bottom border-t-grey-95':
                      !paginationIntersection?.isIntersecting,
                  },
                )}
              >
                <div className="flex gap-2 items-center">
                  <span>{t('cases:list.results_per_page')}</span>
                  {[25, 50, 100].map((limit) => {
                    const isActive = limit === paginationParams.limit;
                    return (
                      <Button
                        key={`pagination-limit-${limit}`}
                        variant="secondary"
                        className={cn(isActive && 'border-purple-65 text-purple-65')}
                        onClick={() => {
                          if (!isActive) {
                            navigateCasesList(filters, { ...paginationParams, limit });
                          }
                        }}
                      >
                        {limit}
                      </Button>
                    );
                  })}
                </div>
                <CursorPaginationButtons
                  items={cases}
                  onPaginationChange={(paginationParams: PaginationParams) =>
                    navigateCasesList(filters, paginationParams)
                  }
                  boundariesDisplay="ranks"
                  hasPreviousPage={hasPreviousPage}
                  pageNb={pageNb}
                  itemsPerPage={paginationParams.limit ?? DEFAULT_CASE_PAGINATION_SIZE}
                  {...pagination}
                />
              </div>
            </CasesFiltersProvider>
            <div ref={paginationSentinelRef} className="absolute left-0 bottom-0" />
          </div>
        </Page.ContentV2>
      </Page.Container>
    </CaseRightPanel.Root>
  );
};
