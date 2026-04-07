import { type UpdateTagPayload, updateTagPayloadSchema } from '@app-builder/schemas/settings';
import { updateTagFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateTagPayloadSchema, type UpdateTagPayload };

export const useUpdateTagMutation = () => {
  const updateTag = useServerFn(updateTagFn);

  return useMutation({
    mutationFn: async (payload: UpdateTagPayload) => updateTag({ data: payload }),
  });
};
