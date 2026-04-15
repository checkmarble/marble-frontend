import { type CreateLinkValue, createLinkValueSchema } from '@app-builder/schemas/data';
import { createLinkFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createLinkValueSchema, type CreateLinkValue };

export const useCreateLinkMutation = () => {
  const createLink = useServerFn(createLinkFn);

  return useMutation({
    mutationKey: ['data', 'create-link'],
    mutationFn: async (link: CreateLinkValue) => createLink({ data: link }),
  });
};
