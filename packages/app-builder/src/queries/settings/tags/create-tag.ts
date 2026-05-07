import { type CreateTagPayload, createTagPayloadSchema } from '@app-builder/schemas/settings';
import { createTagFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type CreateTagPayload, createTagPayloadSchema };

export const useCreateTagMutation = () => {
  const createTag = useServerFn(createTagFn);

  return useMutation({
    mutationFn: async (payload: CreateTagPayload) => createTag({ data: payload }),
  });
};
