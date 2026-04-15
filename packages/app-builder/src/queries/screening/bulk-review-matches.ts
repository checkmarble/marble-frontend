import { setAllMatchesToNoHitFn } from '@app-builder/server-fns/cases';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useBulkReviewMatchesMutation = () => {
  const setAllMatchesToNoHit = useServerFn(setAllMatchesToNoHitFn);

  return useMutation({
    mutationFn: async (matchIds: string[]) => {
      return setAllMatchesToNoHit({ data: { matchIds } });
    },
  });
};
