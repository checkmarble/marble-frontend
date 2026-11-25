import { uploadListDataFileFn } from '@app-builder/server-fns/lists';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUploadListDataFile = (listId: string) => {
  const uploadListDataFile = useServerFn(uploadListDataFileFn);
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const enriched = new FormData();
      for (const [key, value] of formData.entries()) {
        enriched.append(key, value);
      }
      enriched.append('listId', listId);
      return uploadListDataFile({ data: enriched });
    },
  });
};
