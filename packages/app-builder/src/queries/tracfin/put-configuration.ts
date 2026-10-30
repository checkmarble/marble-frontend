import type { TracfinConfigurationInput } from '@app-builder/models/tracfin';
import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { putTracfinConfigurationFn } from '@app-builder/server-fns/tracfin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';

/**
 * Replaces the whole configuration. A rejected PUT throws a `TracfinRequestError`: a 400 carries
 * the diagnostics (see `parseTracfinConfigurationErrors`), a 409 means the revision moved.
 */
export const useTracfinPutConfigurationMutation = () => {
  const putConfiguration = useServerFn(putTracfinConfigurationFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tracfin', 'put-configuration'],
    mutationFn: async (body: TracfinConfigurationInput) => unwrapTracfinResult(await putConfiguration({ data: body })),
    onSuccess: (configuration) => {
      queryClient.setQueryData(tracfinKeys.configuration(), configuration);
    },
  });
};
