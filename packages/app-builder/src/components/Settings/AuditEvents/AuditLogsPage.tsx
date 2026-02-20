import { Page } from '@app-builder/components';
import { Spinner } from '@app-builder/components/Spinner';
import { useBase64Query } from '@app-builder/hooks/useBase64Query';
import { type ApiKey } from '@app-builder/models/api-keys';
import {
  type AuditEventsFilterName,
  auditEventsFilterNames,
  auditEventsFiltersSchema,
  useGetAuditEventsQuery,
} from '@app-builder/queries/audit-events/get-audit-events';
import { type FunctionComponent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';

import { AuditEventsTable } from './AuditEventsTable';
import { type FilterEntry } from './Filters/ActivatedAuditFilterItem';
import { AuditEventsFiltersBar } from './Filters/AuditEventsFiltersBar';
import { PaginationRow } from './PaginationRow';

interface ActivityFollowUpPageProps {
  query: string;
  limit: number;
  updatePage: (newQuery: string, newLimit: number) => void;
  apiKeys: ApiKey[];
}

export const ActivityFollowUpPage: FunctionComponent<ActivityFollowUpPageProps> = ({
  query,
  limit,
  updatePage,
  apiKeys,
}) => {
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

  // Available filters - userId and apiKeyId are mutually exclusive
  const availableFilters = useMemo(() => {
    const hasUserId = parsedQuery.data?.userId !== undefined;
    const hasApiKeyId = parsedQuery.data?.apiKeyId !== undefined;

    return auditEventsFilterNames.filter((name): name is AuditEventsFilterName => {
      // Hide apiKeyId if userId is selected
      if (name === 'apiKeyId' && hasUserId) return false;
      // Hide userId if apiKeyId is selected
      if (name === 'userId' && hasApiKeyId) return false;
      return true;
    });
  }, [parsedQuery.data?.userId, parsedQuery.data?.apiKeyId]);

  // TODO: Remove this filter when 'table' filter is enabled
  const activeFilters = useMemo(() => {
    return parsedQuery.asArray.filter(([name]) => name !== 'table') as FilterEntry[];
  }, [parsedQuery.asArray]);

  const handleSetLimit = useCallback(
    (newLimit: number) => {
      updatePage(query, newLimit);
    },
    [query, updatePage],
  );

  return (
    <Page.Container>
      <Page.ContentV2 className="gap-v2-md bg-surface-page">
        <div className="flex flex-col gap-v2-md relative">
          {/* Title Row */}
          <div className="flex justify-between items-center">
            <h1 className="text-l font-semibold text-grey-primary">{t('settings:audit.audit_logs_section')}</h1>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-v2-sm">
            <AuditEventsFiltersBar
              filters={activeFilters}
              availableFilters={availableFilters}
              updateFilters={parsedQuery.update}
              apiKeys={apiKeys}
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
              <div className="border-red-disabled bg-red-background text-red-primary mt-3 rounded-sm border p-v2-lg flex flex-col gap-v2-sm items-center">
                <span>{t('common:errors.unknown')}</span>
                <Button variant="secondary" onClick={() => auditEventsQuery.refetch()}>
                  {t('common:retry')}
                </Button>
              </div>
            ))
            .with({ isSuccess: true }, () => <AuditEventsTable auditEvents={auditEvents} apiKeys={apiKeys} />)
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
  );
};
