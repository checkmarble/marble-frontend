import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import {
  createFreeFormSearchPresetFn,
  deleteFreeFormSearchPresetFn,
  type FreeformSearchInput,
  FreeformSearchPreset,
  freeformSearchFn,
  getFreeFormSearchPresetFn,
  getListFreeFormSearchPresetsFn,
} from '@app-builder/server-fns/screenings';
import { useMutation, useQuery } from '@tanstack/react-query';
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
