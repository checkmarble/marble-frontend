import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/data/import-org');

export const useImportOrgMutation = () => {
  return useMutation({
    mutationKey: ['data', 'import-org'],
    mutationFn: async (fileContent: unknown) => {
      const response = await fetch(endpoint, {
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
