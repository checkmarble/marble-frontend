import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const uploadScreeningFileEndpoint = (screeningId: string) => {
  return getRoute('/ressources/screenings/upload/:screeningId', { screeningId });
};

export const useUploadScreeningFile = (screeningId: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch(uploadScreeningFileEndpoint(screeningId), {
        body: formData,
        method: 'POST',
      });
    },
  });
};
