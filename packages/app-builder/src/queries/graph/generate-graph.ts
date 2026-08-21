import { type GenerateGraphPayload } from '@app-builder/schemas/graph';
import { generateGraphFn } from '@app-builder/server-fns/graph';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useGetGenerateGraphQuery(payload: GenerateGraphPayload, enabled: boolean = true) {
  const generateGraph = useServerFn(generateGraphFn);

  return useQuery({
    queryKey: [
      'graph',
      'generate',
      payload.recordType,
      payload.recordId,
      payload.degrees,
      payload.types,
      payload.skip_same_field_relations,
      payload.same_field_relations,
    ],
    queryFn: async () => generateGraph({ data: payload }),
    enabled: enabled && !!payload.recordType && !!payload.recordId,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
