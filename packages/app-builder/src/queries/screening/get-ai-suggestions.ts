import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { getScreeningAiSuggestionsFn } from '@app-builder/server-fns/screenings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useCallback } from 'react';

const getScreeningAiSuggestionsQueryKey = (screeningId: string) => ['screenings', 'ai-suggestions', screeningId];

export function useScreeningAiSuggestionsQuery(screeningId: string, enabled: boolean) {
  const getScreeningAiSuggestions = useServerFn(getScreeningAiSuggestionsFn);

  return useQuery({
    queryKey: getScreeningAiSuggestionsQueryKey(screeningId),
    queryFn: async (): Promise<ScreeningAiSuggestion[]> => {
      const result = await getScreeningAiSuggestions({ data: { screeningId } });
      return result.suggestions as ScreeningAiSuggestion[];
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
