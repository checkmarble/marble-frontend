import { RefineSearchInput, refineScreeningFn } from '@app-builder/server-fns/screenings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useRefineScreeningMutation = () => {
  const refineScreening = useServerFn(refineScreeningFn);

  return useMutation({
    mutationFn: async (formValues: RefineSearchInput) => {
      return refineScreening({ data: formValues });
    },
  });
};
