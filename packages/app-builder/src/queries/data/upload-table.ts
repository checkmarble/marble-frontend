import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { UploadLog } from 'marble-api';

const endpoint = (objectType: string) => getRoute('/ressources/ingestion/upload-logs/:objectType', { objectType });

export const uploadTableQueryOptions = (tableName: string, enabled: boolean) => ({
  queryKey: ['ingestion', 'upload-logs', tableName],
  queryFn: async () => {
    const response = await fetch(endpoint(tableName));
    const result = await response.json();
    return result.uploadLogs as UploadLog[];
  },
  enabled,
});

export const useUploadTableQuery = (tableName: string, enabled: boolean) => {
  return useQuery(uploadTableQueryOptions(tableName, enabled));
};
