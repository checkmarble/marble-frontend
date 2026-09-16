import { type FreeformSearchPreset, type SavedFreeformSearchPreset } from '@app-builder/models/freeform-search-preset';
import {
  type SavedScreeningSearchFilters,
  type SavedScreeningSearchPage,
  type ScreeningMatchPayload,
} from '@app-builder/models/screening';
import {
  createFreeFormSearchPresetFn,
  deleteFreeFormSearchPresetFn,
  type FreeformSearchInput,
  freeformSearchFn,
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

export const freeformSearchPresetsQueryKey = ['screening', 'freeform-search', 'presets'] as const;

export const useListFreeFormSearchPresetsQuery = () => {
  const getListFFS = useServerFn(getListFreeFormSearchPresetsFn);

  return useQuery({
    queryKey: freeformSearchPresetsQueryKey,
    queryFn: async () => {
      const result = await getListFFS();
      return result;
    },
  });
};

export const useCreateFreeFormSearchPresetMutation = () => {
  const createFreeFormSearchPreset = useServerFn(createFreeFormSearchPresetFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['screening', 'freeform-search', 'preset', 'create'],
    mutationFn: async ({ name, value }: { name: string; value: FreeformSearchPreset }) => {
      return createFreeFormSearchPreset({ data: { name, value } });
    },
    onSuccess: (result) => {
      if (!result.success) return;
      queryClient.setQueryData<SavedFreeformSearchPreset[]>(freeformSearchPresetsQueryKey, (old = []) => [
        ...old.filter((preset) => preset.id !== result.preset.id),
        result.preset,
      ]);
      void queryClient.invalidateQueries({ queryKey: freeformSearchPresetsQueryKey });
    },
  });
};

export const useDeleteFreeFormSearchPresetMutation = () => {
  const deleteFreeFormSearchPreset = useServerFn(deleteFreeFormSearchPresetFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['screening', 'freeform-search', 'preset', 'delete'],
    mutationFn: async ({ id }: { id: string }) => {
      return deleteFreeFormSearchPreset({ data: { id } });
    },
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<SavedFreeformSearchPreset[]>(freeformSearchPresetsQueryKey, (old) =>
        old?.filter((preset) => preset.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: freeformSearchPresetsQueryKey });
    },
  });
};
