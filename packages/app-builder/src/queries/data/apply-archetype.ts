import { type ApplyArchetypePayload } from '@app-builder/schemas/data';
import { applyArchetypeFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useApplyArchetypeMutation = () => {
  const applyArchetype = useServerFn(applyArchetypeFn);

  return useMutation({
    mutationKey: ['data', 'apply-archetype'],
    mutationFn: async (payload: ApplyArchetypePayload) => applyArchetype({ data: payload }),
  });
};
