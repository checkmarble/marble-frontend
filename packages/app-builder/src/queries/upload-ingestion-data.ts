import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const uploadIngestionDataEndpoint = (objectType: string) => {
  return getRoute('/ressources/ingestion/upload/:objectType', { objectType });
};

export const useUploadIngestionData = (objectType: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch(uploadIngestionDataEndpoint(objectType), {
        body: formData,
        method: 'POST',
      });
    },
  });
};
