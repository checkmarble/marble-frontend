import { type CreatePivotFormValue } from '@app-builder/schemas/data';
import { createPivotFn } from '@app-builder/server-fns/data';
import { type PivotOption } from '@app-builder/services/data/pivot';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreatePivotMutation = () => {
  const createPivot = useServerFn(createPivotFn);

  return useMutation({
    mutationKey: ['data', 'create-pivot'],
    mutationFn: async (pivot: PivotOption) => createPivot({ data: { pivot } as CreatePivotFormValue }),
  });
};
