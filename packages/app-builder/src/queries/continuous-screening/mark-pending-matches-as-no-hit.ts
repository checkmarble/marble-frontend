import type { MarkPendingMatchesAsNoHitPayload } from '@app-builder/schemas/continuous-screenings';
import { markPendingMatchesAsNoHitFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useMarkPendingMatchesAsNoHitMutation = () => {
  const markPendingMatchesAsNoHit = useServerFn(markPendingMatchesAsNoHitFn);

  return useMutation({
    mutationKey: ['continuous-screening', 'mark-pending-matches-as-no-hit'],
    mutationFn: (payload: MarkPendingMatchesAsNoHitPayload) => markPendingMatchesAsNoHit({ data: payload }),
  });
};
