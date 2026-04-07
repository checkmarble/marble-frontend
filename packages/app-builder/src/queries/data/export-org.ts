import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

export const useExportOrgMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: ['data', 'export-org'],
    mutationFn: async () => {
      const endpoint = router.buildLocation({ to: '/ressources/data/export-org' });
      const response = await fetch(endpoint.href);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'org-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    },
  });
};
