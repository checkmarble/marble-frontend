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

async function fetchScreeningDetail(decisionId: string, screeningId: string): Promise<Screening> {
  const url = getRoute('/ressources/screenings/detail/:decisionId/:screeningId', {
    decisionId: fromUUIDtoSUUID(decisionId),
    screeningId: fromUUIDtoSUUID(screeningId),
  });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch screening detail: ${response.status}`);
  }
  const data = await response.json();
  return data.screening as Screening;
}

export function useScreeningDetailQuery(decisionId: string, screeningId: string, enabled: boolean) {
  return useQuery({
    queryKey: getScreeningDetailQueryKey(decisionId, screeningId),
    queryFn: () => fetchScreeningDetail(decisionId, screeningId),
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
