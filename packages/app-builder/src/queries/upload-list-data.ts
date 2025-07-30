import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const uploadListDataFileEndpoint = (listId: string) => {
  return getRoute('/ressources/lists/upload/:listId', { listId });
};

export const useUploadListDataFile = (listId: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch(uploadListDataFileEndpoint(listId), {
        body: formData,
        method: 'POST',
      });
    },
  });
};
