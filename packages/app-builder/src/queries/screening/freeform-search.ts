import {
  type SavedScreeningSearchFilters,
  type SavedScreeningSearchPage,
  type ScreeningMatchPayload,
} from '@app-builder/models/screening';
import {
  type FreeformSearchInput,
  freeformSearchFn,
  listSavedFreeformSearchesFn,
} from '@app-builder/server-fns/screenings';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type FreeformSearchResponse = { success: true; data: ScreeningMatchPayload[] } | { success: false; error: unknown };

export const useFreeformSearchMutation = () => {
  const freeformSearch = useServerFn(freeformSearchFn);

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
  });
};

// type SaveFreeformSearchResponse = { success: true; data: SavedScreeningSearch } | { success: false; error: unknown };

// export const useSaveFreeformSearchMutation = () => {
//   const saveSearch = useServerFn(saveFreeformSearchFn);
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ['screening', 'save-freeform-search'],
//     mutationFn: async (input: SaveFreeformSearchInput): Promise<SaveFreeformSearchResponse> => {
//       return saveSearch({ data: input }) as Promise<SaveFreeformSearchResponse>;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['screening', 'saved-searches'] });
//     },
//   });
// };

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

// type DeleteSavedFreeformSearchResponse = { success: true } | { success: false; error: unknown };

// export const useDeleteSavedFreeformSearchMutation = () => {
//   const deleteSearch = useServerFn(deleteSavedFreeformSearchFn);
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ['screening', 'delete-saved-search'],
//     mutationFn: async (id: string): Promise<DeleteSavedFreeformSearchResponse> => {
//       return deleteSearch({ data: { id } }) as Promise<DeleteSavedFreeformSearchResponse>;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['screening', 'saved-searches'] });
//     },
//   });
// };
