import { uploadScreeningFileFn } from '@app-builder/server-fns/screenings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUploadScreeningFile = (screeningId: string) => {
  const uploadScreeningFile = useServerFn(uploadScreeningFileFn);
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const enriched = new FormData();
      for (const [key, value] of formData.entries()) {
        enriched.append(key, value);
      }
      enriched.append('screeningId', screeningId);
      return uploadScreeningFile({ data: enriched });
    },
  });
};
