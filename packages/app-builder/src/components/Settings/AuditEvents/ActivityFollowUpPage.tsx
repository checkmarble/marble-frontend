import { Page } from '@app-builder/components';
import { PanelProvider } from '@app-builder/components/Panel';
import { useBase64Query } from '@app-builder/hooks/useBase64Query';
import { type AuditEvent } from '@app-builder/models/audit-event';
import { downloadFile } from '@app-builder/utils/download-file';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { AuditEventsTable } from './AuditEventsTable';
import { AuditEventsFiltersBar, auditEventsFilterNames, auditEventsFiltersSchema } from './Filters';
import { PaginationRow } from './PaginationRow';

interface ActivityFollowUpPageProps {
  auditEvents: AuditEvent[];
  hasNextPage: boolean;
  query: string;
  limit: number;
  after?: string;
  updatePage: (newQuery: string, newLimit: number, newAfter?: string) => void;
}

export function ActivityFollowUpPage({
  auditEvents,
  hasNextPage,
  query,
  limit,
  after,
  updatePage,
}: ActivityFollowUpPageProps) {
  const { t } = useTranslation(['settings', 'filters']);

  const parsedQuery = useBase64Query(auditEventsFiltersSchema, query, {
    onUpdate(newQuery) {
      // Reset pagination when filters change
      updatePage(newQuery, limit, undefined);
    },
  });

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

  // Get the last event's ID for cursor-based pagination
  const lastEventId = auditEvents.length > 0 ? auditEvents[auditEvents.length - 1]?.id : undefined;

  const handleNextPage = useCallback(() => {
    if (lastEventId) {
      updatePage(query, limit, lastEventId);
    }
  }, [query, limit, lastEventId, updatePage]);

  const handlePreviousPage = useCallback(() => {
    // Go back to first page (reset cursor)
    updatePage(query, limit, undefined);
  }, [query, limit, updatePage]);

  const handleSetLimit = useCallback(
    (newLimit: number) => {
      // Reset pagination when limit changes
      updatePage(query, newLimit, undefined);
    },
    [query, updatePage],
  );

  return (
    <PanelProvider>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md bg-white">
          <div className="flex flex-col gap-v2-md relative">
            {/* Header Row: Filters on left, Export on right */}
            <div className="flex justify-between">
              <div className="flex items-center gap-v2-sm">
                <AuditEventsFiltersBar
                  filters={parsedQuery.asArray}
                  availableFilters={availableFilters}
                  updateFilters={parsedQuery.update}
                />
              </div>
              <div className="flex items-center gap-v2-sm">
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
            </div>

            {/* Table */}
            <AuditEventsTable auditEvents={auditEvents} />

            {/* Pagination */}
            <PaginationRow
              hasNextPage={hasNextPage}
              hasPreviousPage={!!after}
              currentLimit={limit}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              setLimit={handleSetLimit}
            />
          </div>
        </Page.ContentV2>
      </Page.Container>
    </PanelProvider>
  );
}
