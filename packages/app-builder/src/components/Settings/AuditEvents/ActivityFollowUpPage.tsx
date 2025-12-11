import { Page } from '@app-builder/components';
import { PanelProvider } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useBase64Query } from '@app-builder/hooks/useBase64Query';
import { auditEventsFiltersSchema, useGetAuditEventsQuery } from '@app-builder/queries/audit-events/get-audit-events';
import { downloadFile } from '@app-builder/utils/download-file';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { AuditEventsTable } from './AuditEventsTable';
import { AuditEventsFiltersBar, auditEventsFilterNames } from './Filters';
import { PaginationRow } from './PaginationRow';

interface ActivityFollowUpPageProps {
  query: string;
  limit: number;
  updatePage: (newQuery: string, newLimit: number) => void;
}

export function ActivityFollowUpPage({ query, limit, updatePage }: ActivityFollowUpPageProps) {
  const { t } = useTranslation(['settings', 'filters', 'common']);

  const parsedQuery = useBase64Query(auditEventsFiltersSchema, query, {
    onUpdate(newQuery) {
      updatePage(newQuery, limit);
    },
  });

  const auditEventsQuery = useGetAuditEventsQuery(parsedQuery.data, limit);

  // Flatten pages for display
  const auditEvents = useMemo(() => {
    return auditEventsQuery.data?.pages.flatMap((page) => page.events) ?? [];
  }, [auditEventsQuery.data?.pages]);

  // Available filters
  const availableFilters = useMemo(() => {
    return [...auditEventsFilterNames];
  }, []);

  const handleExportCsv = useCallback(async () => {
    if (auditEvents.length === 0) return;

    const headers = ['Timestamp', 'Actor Type', 'Actor Name', 'Operation', 'Table', 'Entity ID'];
    const rows = auditEvents.map((event) => [
      event.createdAt ?? '',
      event.actor?.type ?? '',
      event.actor?.name ?? '',
      event.operation ?? '',
      event.table ?? '',
      event.entityId ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    await downloadFile(url, `audit-events-${new Date().toISOString().split('T')[0]}.csv`);
  }, [auditEvents]);

  const handleSetLimit = useCallback(
    (newLimit: number) => {
      updatePage(query, newLimit);
    },
    [query, updatePage],
  );

  return (
    <PanelProvider>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md bg-white">
          <div className="flex flex-col gap-v2-md relative">
            {/* Title Row */}
            <div className="flex justify-between items-center">
              <h1 className="text-l font-semibold text-grey-00">{t('settings:activity_follow_up.title')}</h1>
              <ButtonV2
                variant="secondary"
                appearance="stroked"
                onClick={handleExportCsv}
                disabled={auditEvents.length === 0}
              >
                <Icon icon="download" className="size-4" />
                {t('settings:activity_follow_up.export_csv')}
              </ButtonV2>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-v2-sm">
              <AuditEventsFiltersBar
                filters={parsedQuery.asArray}
                availableFilters={availableFilters}
                updateFilters={parsedQuery.update}
              />
            </div>

            {/* Table */}
            {match(auditEventsQuery)
              .with({ isPending: true }, () => (
                <div className="border border-grey-border rounded-v2-md">
                  <div className="h-13 border-b border-grey-border"></div>
                  <div className="h-30 bg-grey-background animate-pulse flex items-center justify-center">
                    <Spinner className="size-12" />
                  </div>
                </div>
              ))
              .with({ isError: true }, () => (
                <div className="border-red-74 bg-red-95 text-red-47 mt-3 rounded-sm border p-v2-lg flex flex-col gap-v2-sm items-center">
                  <span>{t('common:errors.unknown')}</span>
                  <ButtonV2 variant="secondary" onClick={() => auditEventsQuery.refetch()}>
                    {t('common:retry')}
                  </ButtonV2>
                </div>
              ))
              .with({ isSuccess: true }, () => <AuditEventsTable auditEvents={auditEvents} />)
              .exhaustive()}

            {/* Pagination */}
            <PaginationRow
              hasNextPage={auditEventsQuery.hasNextPage ?? false}
              hasPreviousPage={false}
              currentLimit={limit}
              onNextPage={() => auditEventsQuery.fetchNextPage()}
              onPreviousPage={() => undefined}
              setLimit={handleSetLimit}
            />
          </div>
        </Page.ContentV2>
      </Page.Container>
    </PanelProvider>
  );
}
