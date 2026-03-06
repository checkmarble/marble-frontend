import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const fileEndpoint = getRoute('/ressources/data/import-org-file');
const bodyEndpoint = getRoute('/ressources/data/import-org');

export const useImportOrgFromFileMutation = () => {
  return useMutation({
    mutationKey: ['data', 'import-org-file'],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(fileEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      return response.json();
    },
  });
};

export const useImportOrgMutation = () => {
  return useMutation({
    mutationKey: ['data', 'import-org'],
    mutationFn: async (fileContent: unknown) => {
      const response = await fetch(bodyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileContent),
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      return response.json();
    },
  });
};
