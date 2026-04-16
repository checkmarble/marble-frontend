import { type ApplyArchetypePayload, applyArchetypePayloadSchema } from '@app-builder/schemas/data';
import { applyArchetypeFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { applyArchetypePayloadSchema, type ApplyArchetypePayload };

export const useApplyArchetypeMutation = () => {
  const applyArchetype = useServerFn(applyArchetypeFn);

  return useMutation({
    mutationKey: ['data', 'apply-archetype'],
    mutationFn: async (payload: ApplyArchetypePayload) => applyArchetype({ data: payload }),
  });
};
