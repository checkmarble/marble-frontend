import { SaveTriggerPayload, saveTriggerFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useSaveTriggerMutation = () => {
  const saveTrigger = useServerFn(saveTriggerFn);

  return useMutation({
    mutationFn: (payload: SaveTriggerPayload) => saveTrigger({ data: payload }),
  });
};
