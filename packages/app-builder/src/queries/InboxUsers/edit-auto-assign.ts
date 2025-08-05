import { useMutation } from '@tanstack/react-query';

type editAutoAssignInput = {
  id: string;
  autoAssignable: boolean;
};

export function useEditAutoAssignMutation() {
  return useMutation({
    mutationFn: async ({ id, ...params }: editAutoAssignInput): Promise<void> => {
      const response = await fetch(`/ressources/settings/inboxes/inboxusers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit auto assign');
      }

      return response.json();
    },
  });
}
