import { RefineSearchInput, searchScreeningMatchesFn } from '@app-builder/server-fns/screenings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useSearchScreeningMatchesMutation = () => {
  const searchScreeningMatches = useServerFn(searchScreeningMatchesFn);

  return useMutation({
    mutationFn: async (formValues: RefineSearchInput) => {
      return searchScreeningMatches({ data: formValues });
    },
  });
};
