import { getUploadLogsFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUploadTableQuery = (tableName: string, enabled: boolean) => {
  const getUploadLogs = useServerFn(getUploadLogsFn);

  return useQuery({
    queryKey: ['ingestion', 'upload-logs', tableName],
    queryFn: async () => getUploadLogs({ data: { objectType: tableName } }),
    enabled,
  });
};
