import {
  type SavedScreeningSearchFilters,
  type SavedScreeningSearchPage,
  type ScreeningMatchPayload,
} from '@app-builder/models/screening';
import {
  createFreeFormSearchPresetFn,
  deleteFreeFormSearchPresetFn,
  type FreeformSearchInput,
  FreeformSearchPreset,
  freeformSearchFn,
  getFreeFormSearchPresetFn,
  getFreeformSearchFn,
  getListFreeFormSearchPresetsFn,
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

export const useListFreeFormSearchPresetsQuery = () => {
  const getListFFS = useServerFn(getListFreeFormSearchPresetsFn);

  return useQuery({
    queryKey: ['screening', 'freeform-search'],
    queryFn: async () => {
      const result = await getListFFS();
      return result;
    },
  });
};

export const useGetFreeFormSearchPresetQuery = (name: string) => {
  const getFreeFormSearchPreset = useServerFn(getFreeFormSearchPresetFn);

  return useQuery({
    queryKey: ['screening', 'freeform-search', 'preset', name],
    queryFn: async () => {
      const result = await getFreeFormSearchPreset({ data: { name } });
      return result;
    },
  });
};

export const useCreateFreeFormSearchPresetMutation = () => {
  const createFreeFormSearchPreset = useServerFn(createFreeFormSearchPresetFn);

  return useMutation({
    mutationKey: ['screening', 'freeform-search', 'preset'],
    mutationFn: async ({ name, value }: { name: string; value: FreeformSearchPreset }) => {
      console.log('createFreeFormSearchPreset', { name, value });
      return createFreeFormSearchPreset({ data: { name, value } });
    },
  });
};

export const useDeleteFreeFormSearchPresetMutation = () => {
  const deleteFreeFormSearchPreset = useServerFn(deleteFreeFormSearchPresetFn);

  return useMutation({
    mutationKey: ['screening', 'freeform-search', 'preset'],
    mutationFn: async ({ name }: { name: string }) => {
      return deleteFreeFormSearchPreset({ data: { name } });
    },
  });
};
