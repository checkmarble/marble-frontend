import { ScheduledExecution } from '@app-builder/models/decision';
import { listScheduledExecutionsFn } from '@app-builder/server-fns/decisions';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useListScheduleExecutions = () => {
  const listScheduledExecutions = useServerFn(listScheduledExecutionsFn);

  return useQuery({
    queryKey: ['decisions', 'list-scheduled-executions'],
    queryFn: async () => listScheduledExecutions() as Promise<{ scheduledExecutions: ScheduledExecution[] }>,
  });
};
