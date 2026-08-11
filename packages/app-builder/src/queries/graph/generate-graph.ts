import { type GenerateGraphPayload } from '@app-builder/schemas/graph';
import { generateGraphFn } from '@app-builder/server-fns/graph';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useGenerateGraphMutation() {
  const generateGraph = useServerFn(generateGraphFn);

  return useMutation({
    mutationFn: async (payload: GenerateGraphPayload) => generateGraph({ data: payload }),
  });
}
