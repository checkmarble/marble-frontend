import { getScreeningDatasetsFn } from '@app-builder/server-fns/screenings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useScreeningDatasetsQuery = () => {
  const getScreeningDatasets = useServerFn(getScreeningDatasetsFn);

  return useQuery({
    queryKey: ['screening', 'datasets'],
    queryFn: async () => {
      const result = await getScreeningDatasets();
      return result;
    },
  });
};
