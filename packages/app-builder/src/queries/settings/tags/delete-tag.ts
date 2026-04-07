import { type DeleteTagPayload, deleteTagPayloadSchema } from '@app-builder/schemas/settings';
import { deleteTagFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteTagPayloadSchema, type DeleteTagPayload };

export const useDeleteTagMutation = () => {
  const deleteTag = useServerFn(deleteTagFn);

  return useMutation({
    mutationFn: async (payload: DeleteTagPayload) => deleteTag({ data: payload }),
  });
};
