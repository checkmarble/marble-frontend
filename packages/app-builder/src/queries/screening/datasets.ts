import { getScreeningDatasetsFn } from '@app-builder/server-fns/screenings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { OpenSanctionsCatalogDto } from 'marble-api';

export const useScreeningDatasetsQuery = () => {
  const getScreeningDatasets = useServerFn(getScreeningDatasetsFn);

  return useQuery({
    queryKey: ['screening', 'datasets'],
    queryFn: async () => {
      const result = await getScreeningDatasets();
      console.log('result', result);
      return result as { datasets: OpenSanctionsCatalogDto };
    },
  });
};
