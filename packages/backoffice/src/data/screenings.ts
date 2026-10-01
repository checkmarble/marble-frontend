import type { MotivaQuery } from '@bo/schemas/screenings';
import { runMotivaMatchFn } from '@bo/server-fns/screenings';
import type { ScreeningProvider } from '@bo/utils/motiva-provider';
import { mutationOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useRunMotivaMatchMutationOptions = (provider: ScreeningProvider) => {
  const runMotivaMatch = useServerFn(runMotivaMatchFn);

  return mutationOptions({
    mutationFn: (query: MotivaQuery) => runMotivaMatch({ data: { provider, query } }),
  });
};
