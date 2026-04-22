import { AddConfigurationPayload } from '@app-builder/schemas/client360';
import { addClient360ConfigurationFn } from '@app-builder/server-fns/client-360';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useAddConfigurationMutation = () => {
  const addConfiguration = useServerFn(addClient360ConfigurationFn);

  return useMutation({
    mutationKey: ['client360', 'add-configuration'],
    mutationFn: (payload: AddConfigurationPayload) => addConfiguration({ data: payload }),
  });
};
