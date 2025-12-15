import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { OpenSanctionsCatalogDto } from 'marble-api';

const endpoint = getRoute('/ressources/screenings/get-datasets');

export const useScreeningDatasetsQuery = () => {
  return useQuery({
    queryKey: ['screening', 'datasets'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      return response.json() as Promise<{ datasets: OpenSanctionsCatalogDto }>;
    },
  });
};
