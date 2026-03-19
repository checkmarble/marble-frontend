import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type Screening } from '@app-builder/models/screening';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const getScreeningDetailQueryKey = (decisionId: string, screeningId: string) => [
  'screenings',
  'detail',
  decisionId,
  screeningId,
];

const endpoint = (decisionId: string, screeningId: string) =>
  getRoute('/ressources/screenings/detail/:decisionId/:screeningId', {
    decisionId: fromUUIDtoSUUID(decisionId),
    screeningId: fromUUIDtoSUUID(screeningId),
  });

export function useScreeningDetailQuery(decisionId: string, screeningId: string, enabled: boolean) {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: getScreeningDetailQueryKey(decisionId, screeningId),
    queryFn: async () => {
      const response = await fetch(endpoint(decisionId, screeningId));
      if (!response.ok) {
        throw new Error(`Failed to fetch screening detail: ${response.status}`);
      }
      const result: { screening: Screening } | { redirectTo: string } = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        throw new Error('Session expired');
      }

      return result.screening;
    },
    enabled,
  });
}

export function useInvalidateScreeningDetail() {
  const queryClient = useQueryClient();
  return useCallback(
    (decisionId: string, screeningId: string) => {
      queryClient.invalidateQueries({
        queryKey: getScreeningDetailQueryKey(decisionId, screeningId),
      });
    },
    [queryClient],
  );
}
