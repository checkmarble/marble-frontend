import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FreeformSearchInput, freeformSearchFn } from '@app-builder/server-fns/screenings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type FreeformSearchResponse = { success: true; data: ScreeningMatchPayload[] } | { success: false; error: unknown };

export const useFreeformSearchMutation = () => {
  const freeformSearch = useServerFn(freeformSearchFn);

  return useMutation({
    mutationKey: ['screening', 'freeform-search'],
    mutationFn: async (input: FreeformSearchInput): Promise<FreeformSearchResponse> => {
      return freeformSearch({ data: input }) as Promise<FreeformSearchResponse>;
    },
  });
};
