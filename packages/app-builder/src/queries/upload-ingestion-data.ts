import { uploadIngestionDataFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUploadIngestionData = (objectType: string) => {
  const uploadIngestionData = useServerFn(uploadIngestionDataFn);
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const enriched = new FormData();
      for (const [key, value] of formData.entries()) {
        enriched.append(key, value);
      }
      enriched.append('objectType', objectType);
      return uploadIngestionData({ data: enriched });
    },
  });
};
