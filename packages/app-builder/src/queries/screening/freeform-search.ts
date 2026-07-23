import {
  type SavedScreeningSearchFilters,
  type SavedScreeningSearchPage,
  type ScreeningMatchPayload,
} from '@app-builder/models/screening';
import {
  type FreeformSearchInput,
  freeformSearchFn,
  getFreeformSearchFn,
  listSavedFreeformSearchesFn,
  saveFreeformSearchFn,
} from '@app-builder/server-fns/screenings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type FreeformSearchResponse = { id: string; matches: ScreeningMatchPayload[] };

export const useFreeformSearchMutation = () => {
  const freeformSearch = useServerFn(freeformSearchFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['screening', 'freeform-search'],
    mutationFn: async (input: FreeformSearchInput): Promise<FreeformSearchResponse> => {
      return freeformSearch({ data: input }) as Promise<FreeformSearchResponse>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['screening', 'saved-searches'] });
    },
  });
};

export const useSaveFreeformSearchMutation = () => {
  const queryClient = useQueryClient();
  const saveFreeformSearch = useServerFn(saveFreeformSearchFn);

  return useMutation({
    mutationKey: ['screening', 'save-freeform-search'],
    mutationFn: async (input: { id: string }): Promise<void> => {
      await saveFreeformSearch({ data: input });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['screening', 'saved-searches'] });
    },
  });
};

export const useSavedFreeformSearchesQuery = (filters: SavedScreeningSearchFilters = {}) => {
  const listSavedSearches = useServerFn(listSavedFreeformSearchesFn);

  return useQuery({
    queryKey: ['screening', 'saved-searches', filters],
    queryFn: async (): Promise<SavedScreeningSearchPage> => {
      return listSavedSearches({ data: filters }) as Promise<SavedScreeningSearchPage>;
    },
  });
};

type GetFreeformSearchResponse = { id: string; matches: ScreeningMatchPayload[] };

export const useGetFreeformSearchQuery = (id: string) => {
  const getFreeformSearch = useServerFn(getFreeformSearchFn);
  return useQuery({
    queryKey: ['screening', 'freeform-search', id],
    queryFn: async (): Promise<GetFreeformSearchResponse> => {
      return getFreeformSearch({ data: { id } }) as Promise<GetFreeformSearchResponse>;
    },
  });
};
