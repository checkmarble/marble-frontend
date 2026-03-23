import { getRoute } from '@app-builder/utils/routes';
import { useRevalidator } from '@remix-run/react';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/scoring/prepare-ruleset');

export const usePrepareScoringRulesetMutation = () => {
  const revalidator = useRevalidator();

  return useMutation({
    mutationKey: ['scoring', 'prepare-ruleset'],
    mutationFn: async (recordType: string) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ recordType }),
      });
      return response.json();
    },
    onSuccess: () => {
      revalidator.revalidate();
    },
  });
};
