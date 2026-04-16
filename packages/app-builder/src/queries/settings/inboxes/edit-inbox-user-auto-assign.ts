import {
  type EditInboxUserAutoAssignPayload,
  editInboxUserAutoAssignPayloadSchema,
} from '@app-builder/schemas/settings';
import { editInboxUserAutoAssignFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { editInboxUserAutoAssignPayloadSchema, type EditInboxUserAutoAssignPayload };

export function useEditInboxUserAutoAssignMutation() {
  const editInboxUserAutoAssign = useServerFn(editInboxUserAutoAssignFn);

  return useMutation({
    mutationFn: async (payload: EditInboxUserAutoAssignPayload) => editInboxUserAutoAssign({ data: payload }),
  });
}
