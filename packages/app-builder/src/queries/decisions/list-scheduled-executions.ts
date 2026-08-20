import { hasInProgressScheduledExecution, type ScheduledExecution } from '@app-builder/models/decision';
import { listScheduledExecutionsFn } from '@app-builder/server-fns/decisions';
import { type Query, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type ListScheduledExecutionsResult = { scheduledExecutions: ScheduledExecution[] };

type ListScheduledExecutionsQuery = Query<
  ListScheduledExecutionsResult,
  Error,
  ListScheduledExecutionsResult,
  (string | { scenarioId?: string })[]
>;

export const SCHEDULED_EXECUTIONS_REFETCH_INTERVAL_MS = 1_000;

export function getScheduledExecutionsRefetchInterval(executions: readonly Pick<ScheduledExecution, 'status'>[]) {
  return hasInProgressScheduledExecution(executions) ? SCHEDULED_EXECUTIONS_REFETCH_INTERVAL_MS : false;
}

export function useListScheduleExecutions({
  scenarioId,
  initialData,
  refetchInterval,
}: {
  scenarioId?: string;
  initialData?: { scheduledExecutions: ScheduledExecution[] };
  refetchInterval?: number | false | ((query: ListScheduledExecutionsQuery) => number | false | undefined);
} = {}) {
  const listScheduledExecutions = useServerFn(listScheduledExecutionsFn);
  return useQuery({
    queryKey: ['decisions', 'list-scheduled-executions', { scenarioId }],
    queryFn: () => listScheduledExecutions({ data: { scenarioId } }),
    initialData,
    refetchInterval,
  });
}
