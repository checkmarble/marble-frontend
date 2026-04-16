import { type CreateTagPayload, createTagPayloadSchema } from '@app-builder/schemas/settings';
import { createTagFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createTagPayloadSchema, type CreateTagPayload };

export const useCreateTagMutation = () => {
  const createTag = useServerFn(createTagFn);

  return useMutation({
    mutationFn: async (payload: CreateTagPayload) => createTag({ data: payload }),
  });
};
