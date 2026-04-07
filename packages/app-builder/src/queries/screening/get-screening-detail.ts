import { type Screening } from '@app-builder/models/screening';
import { getScreeningDetailFn } from '@app-builder/server-fns/screenings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useCallback } from 'react';

const getScreeningDetailQueryKey = (decisionId: string, screeningId: string) => [
  'screenings',
  'detail',
  decisionId,
  screeningId,
];

export function useScreeningDetailQuery(decisionId: string, screeningId: string, enabled: boolean) {
  const getScreeningDetail = useServerFn(getScreeningDetailFn);

  return useQuery({
    queryKey: getScreeningDetailQueryKey(decisionId, screeningId),
    queryFn: async (): Promise<Screening> => {
      const result = await getScreeningDetail({ data: { decisionId, screeningId } });
      return result.screening as Screening;
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
