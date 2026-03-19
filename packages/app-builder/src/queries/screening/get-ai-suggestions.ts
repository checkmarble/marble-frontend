import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const getScreeningAiSuggestionsQueryKey = (screeningId: string) => ['screenings', 'ai-suggestions', screeningId];

const endpoint = (screeningId: string) =>
  getRoute('/ressources/screenings/ai-suggestions/:screeningId', {
    screeningId: fromUUIDtoSUUID(screeningId),
  });

export function useScreeningAiSuggestionsQuery(screeningId: string, enabled: boolean) {
  return useQuery({
    queryKey: getScreeningAiSuggestionsQueryKey(screeningId),
    queryFn: async () => {
      const response = await fetch(endpoint(screeningId));
      if (!response.ok) {
        throw new Error(`Failed to fetch AI suggestions: ${response.status}`);
      }
      const result: { suggestions: ScreeningAiSuggestion[] } | { redirectTo: string } = await response.json();

      if ('redirectTo' in result) {
        return [];
      }

      return result.suggestions;
    },
    enabled,
  });
}

export function useInvalidateScreeningAiSuggestions() {
  const queryClient = useQueryClient();
  return useCallback(
    (screeningId: string) => {
      queryClient.invalidateQueries({
        queryKey: getScreeningAiSuggestionsQueryKey(screeningId),
      });
    },
    [queryClient],
  );
}
