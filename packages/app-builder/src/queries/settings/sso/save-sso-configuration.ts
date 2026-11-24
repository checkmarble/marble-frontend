import { type SaveSsoConfigurationPayload, saveSsoConfigurationPayloadSchema } from '@app-builder/schemas/settings';
import { saveSsoConfigurationFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type SaveSsoConfigurationPayload, saveSsoConfigurationPayloadSchema };

export const useSaveSsoConfigurationMutation = () => {
  const saveSsoConfiguration = useServerFn(saveSsoConfigurationFn);

  return useMutation({
    mutationKey: ['settings', 'sso', 'save-configuration'],
    mutationFn: async (payload: SaveSsoConfigurationPayload) => saveSsoConfiguration({ data: payload }),
  });
};
