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

type FreeformSearchResponse =
  | { success: true; data: { id: string; matches: ScreeningMatchPayload[] } }
  | { success: false; error: unknown };

export const useFreeformSearchMutation = () => {
  const freeformSearch = useServerFn(freeformSearchFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['screening', 'freeform-search'],
    mutationFn: async (input: FreeformSearchInput): Promise<FreeformSearchResponse> => {
      // TODO: remove this filter when reindexation is done
      const datasets =
        input.entityType !== 'Person'
          ? input.datasets?.filter(
              (dataset) =>
                dataset !== 'global:topic:liveness:filter.alive' && dataset !== 'global:topic:liveness:filter.deceased',
            )
          : input.datasets;
      return freeformSearch({ data: { ...input, datasets } }) as Promise<FreeformSearchResponse>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['screening', 'saved-searches'] });
    },
  });
};

type SaveFreeformSearchResponse = { success: true } | { success: false; error: unknown };

export const useSaveFreeformSearchMutation = () => {
  const queryClient = useQueryClient();
  const saveFreeformSearch = useServerFn(saveFreeformSearchFn);

  return useMutation({
    mutationKey: ['screening', 'save-freeform-search'],
    mutationFn: async (input: { id: string }): Promise<SaveFreeformSearchResponse> => {
      return saveFreeformSearch({ data: input });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['screening', 'saved-searches'] });
    },
  });
};

type ListSavedFreeformSearchesResponse =
  | { success: true; data: SavedScreeningSearchPage }
  | { success: false; error: unknown };

export const useSavedFreeformSearchesQuery = (filters: SavedScreeningSearchFilters = {}) => {
  const listSavedSearches = useServerFn(listSavedFreeformSearchesFn);

  return useQuery({
    queryKey: ['screening', 'saved-searches', filters],
    queryFn: async (): Promise<ListSavedFreeformSearchesResponse> => {
      return listSavedSearches({ data: filters }) as Promise<ListSavedFreeformSearchesResponse>;
    },
  });
};

type GetFreeformSearchResponse =
  | { success: true; data: { id: string; matches: ScreeningMatchPayload[] } }
  | { success: false; error: unknown };

export const useGetFreeformSearchQuery = (id: string) => {
  const getFreeformSearch = useServerFn(getFreeformSearchFn);
  return useQuery({
    queryKey: ['screening', 'freeform-search', id],
    queryFn: async (): Promise<GetFreeformSearchResponse> => {
      return getFreeformSearch({ data: { id } }) as Promise<GetFreeformSearchResponse>;
    },
  });
};
